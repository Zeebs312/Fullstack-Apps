"use client";

import { useState, useRef } from "react";
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

    // Mount state for hydration safe theme toggle
    useState(() => {
        setMounted(true);
    });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const bannerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    // Delayed transform: Title fades in only as scroll passes the midpoint of the banner (30% to 33%)
    const navTitleOpacity = useTransform(scrollYProgress, [0.30, 0.33], [0, 1]);
    const navTitleTranslate = useTransform(scrollYProgress, [0.30, 0.33], [-10, 0]);

    // Map PostgreSQL database entries dynamically to your CardConfig structure
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
            title: e.title,
            category: e.category,
            content: e.content,
            datePublished: e.datePublished
        });
        return result.success ? result.data : null;
    }).filter(Boolean) as any[];

    return (
        <main ref={containerRef} className="relative min-h-screen w-full flex flex-col bg-background font-sans antialiased">
            {/* Top Navigation Bar: Title on Left, Theme Toggle on Right */}
            <div className="fixed top-0 left-0 w-full px-6 py-6 z-50 flex items-center justify-between pointer-events-none">
                {/* Top-Left Title */}
                <motion.div
                    style={{
                        opacity: navTitleOpacity,
                        y: navTitleTranslate
                    }}
                    className="pointer-events-auto cursor-pointer"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <span className="text-lg md:text-xl font-bold tracking-tight text-foreground drop-shadow-sm">
                        Down the Burrow
                    </span>
                </motion.div>

                {/* Top-Right Theme Toggle */}
                <div className="pointer-events-auto">
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
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/90 to-foreground/60 leading-[1.05] py-4">
                                Down the Burrow
                            </h1>
                        </div>
                    </motion.div>

                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-background pointer-events-none z-10" />
                </div>
            </div>

            {/* Content Layer */}
            <div className="relative z-20 w-full px-4 md:px-10 py-12 bg-background -mt-16">
                <div className="max-w-[110rem] mx-auto mb-12 text-center flex flex-col items-center">
                    <div className="w-12 h-[1px] bg-border mb-6" />
                    <p className="text-foreground/90 text-lg md:text-2xl font-medium tracking-tight max-w-2xl leading-relaxed">
                        Where a simple question turns into a <span className="font-semibold text-foreground">3 AM obsession</span>
                    </p>
                    <div className="w-12 h-[1px] bg-border mt-6" />
                </div>

                {/* Interactive Year Bar */}
                <div className="max-w-[110rem] mx-auto mb-12 flex items-center justify-center gap-2 md:gap-4 pb-2">
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

                {/* Ultra-wide Cards Grid: Flexible Image Containers */}
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 w-full max-w-[110rem] mx-auto space-y-8">
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
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                                />
                            </motion.div>
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

            {/* Render DeepDiveView with full activeCardConfig object */}
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