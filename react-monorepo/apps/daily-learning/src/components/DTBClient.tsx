"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { LearningEntrySchema } from "@repo/shared-types";
import DeepDiveView, { CardConfig } from "@/components/DeepDiveView";

interface DTBClientProps {
    dbEntries: any[];
}

export default function DTBClient({ dbEntries }: DTBClientProps) {
    const containerRef = useRef<HTMLElement>(null);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [activeCard, setActiveCard] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>("All");

    useEffect(() => {
        setMounted(true);
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const bannerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    // Taskbar animates into view right as the hero title fades out/scrolls past
    const taskbarOpacity = useTransform(scrollYProgress, [0.23, 0.29], [0, 1]);
    const taskbarTranslateY = useTransform(scrollYProgress, [0.23, 0.29], [-20, 0]);

    const cardsConfig: CardConfig[] = dbEntries.map((entry) => {
        const primaryImage = entry.imageUrls[0] || "/banner.jpg";

        const sections = entry.descriptions && entry.descriptions.length > 0
            ? entry.descriptions.map((desc: string, idx: number) => ({
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
            datePublished: entry.datePublished || "2026",
            resources: entry.resources || [],
        };
    });

    const filteredCards = cardsConfig.filter(card => {
        if (selectedYear === "All") return true;
        return card.datePublished?.includes(selectedYear);
    });

    const activeCardConfig = cardsConfig.find(c => c.type === activeCard);

    const validatedEntries = dbEntries.map(e => {
        const result = LearningEntrySchema.safeParse({
            id: e.id,
            slug: e.slug,
            title: e.title,
            category: e.category,
            content: e.content,
            datePublished: e.datePublished,
            resources: e.resources,
            descriptions: e.descriptions
        });
        return result.success ? result.data : null;
    }).filter(Boolean) as any[];

    return (
        <main ref={containerRef} className="relative min-h-screen w-full flex flex-col bg-background font-sans antialiased overflow-x-hidden">
            {/* Top Taskbar Navigation */}
            <motion.header
                style={{
                    opacity: taskbarOpacity,
                    y: taskbarTranslateY,
                }}
                className="fixed top-0 left-0 w-full px-6 py-4 z-50 flex items-center justify-between bg-background/85 backdrop-blur-md border-b border-border/60 pointer-events-auto"
            >
                <div
                    className="cursor-pointer flex items-center gap-2"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <span className="text-sm md:text-base font-bold tracking-tight text-foreground">
                        Down the Burrow
                    </span>
                    <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                        // Archive
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    {mounted ? (
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            aria-label="Toggle theme"
                            className="p-2 text-foreground/80 hover:text-foreground transition-colors cursor-pointer flex items-center justify-center bg-transparent border-none shadow-none"
                        >
                            {theme === "dark" ? (
                                <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
                            ) : (
                                <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 hover:-rotate-12" />
                            )}
                        </button>
                    ) : (
                        <div className="w-8 h-8" />
                    )}
                </div>
            </motion.header>

            {/* Sticky Hero Banner Container */}
            <div className="relative w-full h-[60vh] md:h-[80vh]">
                <div className="sticky top-0 w-full h-[60vh] md:h-[80vh] overflow-hidden pointer-events-none">
                    <motion.div
                        style={{ opacity: bannerOpacity }}
                        className="relative w-full h-full pointer-events-auto"
                    >
                        <Image src="/banner.jpg" alt="Banner" fill priority className="object-cover" />

                        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-transparent flex flex-col justify-end p-6 pb-12 md:p-16 md:pb-20 z-20">
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/90 to-foreground/60 leading-[1.05] py-4">
                                Down the Burrow
                            </h1>
                        </div>
                    </motion.div>

                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-background pointer-events-none z-10" />
                </div>
            </div>

            {/* Content Layer */}
            <div className="relative z-20 w-full py-12 bg-background -mt-16">
                <div className="w-full px-6 mb-12 text-center flex flex-col items-center">
                    <div className="w-12 h-[1px] bg-border mb-6" />
                    <p className="text-foreground/90 text-lg md:text-2xl font-medium tracking-tight max-w-2xl leading-relaxed">
                        Where a simple question turns into a <span className="font-semibold text-foreground">3 AM obsession</span>
                    </p>
                    <div className="w-12 h-[1px] bg-border mt-6" />
                </div>

                {/* Interactive Year Bar */}
                <div className="w-full px-6 mb-12 flex items-center justify-center gap-2 md:gap-4 pb-2">
                    {["All", "2026"].map((year) => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`px-6 py-2.5 text-xs md:text-sm font-mono uppercase tracking-widest transition-all duration-300 cursor-pointer rounded-none border ${selectedYear === year
                                    ? "bg-[#a995c9] text-black border-[#a995c9] shadow-md font-bold"
                                    : "bg-card/50 text-muted-foreground border-border/60 hover:border-[#a995c9]/60 hover:text-foreground"
                                }`}
                        >
                            {year}
                        </button>
                    ))}
                </div>

                {/* Full-Width 3-Column Grid */}
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 w-full px-4 space-y-4">
                    {filteredCards.map((card) => (
                        <div
                            key={card.type}
                            onClick={() => setActiveCard(card.type)}
                            className="bg-card border border-border/60 shadow-sm hover:shadow-2xl cursor-pointer hover:border-[#a995c9]/60 transition-all duration-300 overflow-hidden flex flex-col break-inside-avoid rounded-none group"
                        >
                            <motion.div
                                layoutId={`card-image-${card.type}`}
                                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                                className="w-full relative overflow-hidden"
                            >
                                <Image
                                    src={card.image}
                                    alt={card.title}
                                    width={1200}
                                    height={800}
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                                />
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Component */}
            <footer className="relative z-20 w-full border-t border-border/60 bg-background py-12 px-6 md:px-16 mt-16">
                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start">
                        <span className="text-base font-bold tracking-tight text-foreground">
                            Down the Burrow
                        </span>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                            An ongoing archive of curious deep dives & late-night rabbit holes.
                        </p>
                    </div>

                    {/* Vertical line stack for the footer actions */}
                    <div className="flex flex-col items-center md:items-end gap-2.5 text-xs text-muted-foreground font-mono">
                        <a
                            href="https://github.com/Zeebs312?tab=repositories"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            GitHub (Osebor Evbodaghe)
                        </a>
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 bg-transparent border-none p-0 shadow-none"
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

            {/* Render DeepDiveView */}
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