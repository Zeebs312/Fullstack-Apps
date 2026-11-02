"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import DeepDiveView, { CardConfig } from "@/components/DeepDiveView";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { LearningEntry as PrismaEntry } from "@prisma/client";
import { LearningEntrySchema } from '@repo/shared-types';

interface Props {
    dbEntries: PrismaEntry[];
}

export default function DTBClient({ dbEntries }: Props) {
    const [activeCard, setActiveCard] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const bannerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    // Map PostgreSQL database entries dynamically to your CardConfig structure
    const cardsConfig: CardConfig[] = dbEntries.map((entry) => {
        const primaryImage = entry.imageUrls[0] || "/banner.jpg";

        // Build sections from descriptions and image arrays
        const sections = entry.descriptions && entry.descriptions.length > 0
            ? entry.descriptions.map((desc, idx) => ({
                paragraph: desc,
                image: entry.imageUrls[idx] || primaryImage,
                title: entry.title,
                category: entry.category,
                datePublished: entry.datePublished,
            }))
            : undefined;

        return {
            type: entry.slug,
            title: entry.title,
            description: entry.content,
            image: primaryImage,
            isCustomContent: entry.slug === 'rabies',
            sections: sections,
        };
    });

    const activeCardConfig = cardsConfig.find(c => c.type === activeCard);

    // Build validated entries fallback array for shared types
    const validatedEntries = dbEntries.map(e => {
        const result = LearningEntrySchema.safeParse({
            id: e.id,
            title: e.title,
            category: e.category,
            content: e.content,
            datePublished: e.datePublished
        });
        return result.success ? result.data : null;
    }).filter(Boolean) as any[];

    return (
        <main ref={containerRef} className="relative min-h-screen w-full flex flex-col bg-background font-sans antialiased">
            {/* Top Navigation Bar with Theme Toggle */}
            <div className="fixed top-6 right-6 z-50">
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        aria-label="Toggle theme"
                        className="p-3 bg-background/80 backdrop-blur-md border border-border/60 text-foreground hover:border-primary/60 transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center rounded-none"
                    >
                        {theme === "dark" ? (
                            <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-45" />
                        ) : (
                            <Moon className="w-5 h-5 transition-transform duration-300 rotate-0 hover:-rotate-12" />
                        )}
                    </button>
                )}
            </div>

            {/* Sticky Hero Banner Container */}
            <div className="relative w-full h-[60vh] md:h-[80vh]">
                <div className="sticky top-0 w-full h-[60vh] md:h-[80vh] overflow-hidden pointer-events-none">
                    <motion.div
                        style={{ opacity: bannerOpacity }}
                        className="relative w-full h-full pointer-events-auto"
                    >
                        <Image src="/banner.jpg" alt="Banner" fill priority className="object-cover" />

                        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-transparent flex flex-col justify-end p-6 pb-12 md:p-16 md:pb-20 z-20">
                            <span className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-muted-foreground/80 mb-2">
                                Curated Research & Archive
                            </span>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/90 to-foreground/60 leading-[1.05] py-2">
                                Down the Burrow
                            </h1>
                        </div>
                    </motion.div>

                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-background pointer-events-none z-10" />
                </div>
            </div>

            {/* Content Layer (Cards Grid Container) */}
            <div className="relative z-20 w-full px-4 md:px-10 py-12 bg-background -mt-16">
                <div className="max-w-[110rem] mx-auto mb-16 text-center flex flex-col items-center">
                    <div className="w-12 h-[1px] bg-border mb-6" />
                    <p className="text-foreground/90 text-lg md:text-2xl font-medium tracking-tight max-w-2xl leading-relaxed">
                        Where a simple question turns into a <span className="font-semibold text-foreground">3 AM obsession</span>
                    </p>
                    <div className="w-12 h-[1px] bg-border mt-6" />
                </div>

                {/* Ultra-wide Cards Grid populated from database */}
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 w-full max-w-[110rem] mx-auto space-y-8">
                    {cardsConfig.map((card) => (
                        <div
                            key={card.type}
                            onClick={() => setActiveCard(card.type)}
                            className="bg-card border border-border/60 shadow-sm hover:shadow-2xl cursor-pointer hover:border-primary/60 transition-all duration-300 overflow-hidden flex flex-col break-inside-avoid rounded-none group"
                        >
                            <div className="w-full relative overflow-hidden aspect-[4/3]">
                                <Image
                                    src={card.image}
                                    alt={card.title}
                                    fill
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                />
                            </div>

                            <div className="p-6 flex flex-col justify-between bg-card">
                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                                    {card.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Component */}
            <footer className="relative z-20 w-full border-t border-border/60 bg-background py-12 px-6 md:px-16 mt-16">
                <div className="max-w-[110rem] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start">
                        <span className="text-base font-bold tracking-tight text-foreground">
                            Down the Burrow
                        </span>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                            An ongoing archive of curious deep dives & late-night rabbit holes.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-muted-foreground font-mono">
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-2"
                            >
                                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                Switch to {theme === "dark" ? "Light" : "Dark"} Mode
                            </button>
                        )}
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="hover:text-foreground transition-colors cursor-pointer"
                        >
                            ↑ Back to Top
                        </button>
                    </div>
                </div>
            </footer>

            {/* Render DeepDiveView directly */}
            {activeCard && activeCardConfig && (
                <DeepDiveView
                    card={activeCardConfig}
                    validatedEntries={validatedEntries}
                    onClose={() => setActiveCard(null)}
                />
            )}
        </main>
    );
}