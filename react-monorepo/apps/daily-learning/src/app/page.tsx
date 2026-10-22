"use client";

import { useState, useRef, useEffect } from "react";
import { LearningEntry, LearningEntrySchema } from '@repo/shared-types';
import Image from "next/image";
import DeepDiveOverlay, { CardConfig } from "@/components/DeepDiveView";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const initialEntries: LearningEntry[] = [
    {
        id: '1',
        title: 'Configuring pnpm Workspaces & Monorepos',
        category: 'DevOps',
        content: 'Learned how to properly link packages using workspace:* protocols.',
        datePublished: '2026-10-04',
    },
];

const validatedEntries = initialEntries.map((entry) => LearningEntrySchema.parse(entry));

type CardType = "rabies" | "castrato" | "rat" | "caduceus" | "gravity" | "windchimes" | null;

const cardsConfig: CardConfig[] = [
    {
        type: "rabies",
        title: "Rabies",
        description: "The historical progression and pathology of the virus.",
        image: "/rabies.jpg",
        isCustomContent: true,
    },
    {
        type: "castrato",
        title: "The Castrato",
        image: "/castrato.jpg",
        description: "Explore the history of opera's legendary soprano-range male vocalists.",
        sections: [
            {
                paragraph: "The story of the Castrati is one of the most remarkable and disturbing in musical history. From the 16th to the 19th century, thousands of boys were castrated before puberty to preserve their high vocal registers.",
                image: "/castrato.jpg"
            },
            {
                paragraph: "In the Baroque era, they became the superstars of opera, commanding enormous fees and adulation. Their voices were described as otherworldly, capable of extraordinary breath control.",
                image: "/castrato.jpg"
            },
            {
                paragraph: "Rigorous daily training included hours of vocal exercises, studying ornamentation, and mastering dramatic stage presence alongside conservatory tutors.",
                image: "/castrato.jpg"
            },
            {
                paragraph: "As musical tastes shifted toward romanticism and realism, public sentiment turned against the practice, leading to official bans and the eventual end of the era.",
                image: "/castrato.jpg"
            }
        ]
    },
    {
        type: "rat",
        title: "Rat Evolution",
        image: "/rats.jpg",
        description: "An evolutionary deep dive into rodent adaptation.",
        sections: [
            {
                paragraph: "Rodents represent nearly half of all mammalian species, originating millions of years ago and outliving many larger prehistoric competitors.",
                image: "/rats.jpg"
            },
            {
                paragraph: "Their highly adaptable jaw structure and constantly growing incisors allow them to consume almost any food source available in human environments.",
                image: "/rats.jpg"
            },
            {
                paragraph: "Living alongside human settlements provided rats with endless shelter and food security, fueling their global expansion.",
                image: "/rats.jpg"
            }
        ]
    },
    {
        type: "caduceus",
        title: "The Caduceus Symbolism",
        image: "/caduceus.jpg",
        description: "Unpacking the historical confusion between Hermes staff and the Rod of Asclepius.",
        sections: [
            {
                paragraph: "The staff of Hermes features two intertwined serpents and wings, originally symbolizing heraldry, commerce, and negotiation.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "Confusion arose in the early 20th century when the U.S. Army Medical Corps mistakenly adopted the Caduceus instead of the true medical emblem.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "The authentic symbol of medicine is the Rod of Asclepius - a single snake wrapped around a rough wooden staff.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "Despite historical corrections by historians, the Caduceus remains deeply entrenched in commercial medical branding worldwide.",
                image: "/caduceus.jpg"
            }
        ]
    },
    {
        type: "gravity",
        title: "Gravity Rooms",
        description: "Exploring the mechanics of artificial gravity and rotational environments.",
        image: "/gravity.jpg",
        sections: [
            {
                paragraph: "The staff of Hermes features two intertwined serpents and wings, originally symbolizing heraldry, commerce, and negotiation.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "Confusion arose in the early 20th century when the U.S. Army Medical Corps mistakenly adopted the Caduceus instead of the true medical emblem.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "The authentic symbol of medicine is the Rod of Asclepius - a single snake wrapped around a rough wooden staff.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "Despite historical corrections by historians, the Caduceus remains deeply entrenched in commercial medical branding worldwide.",
                image: "/caduceus.jpg"
            }
        ]
    },
    {
        type: "windchimes",
        title: "Windchimes",
        description: "The acoustic resonance, harmonic structure, and kinetic physics of windchimes.",
        image: "/windchime.png",
        sections: [
            {
                paragraph: "The staff of Hermes features two intertwined serpents and wings, originally symbolizing heraldry, commerce, and negotiation.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "Confusion arose in the early 20th century when the U.S. Army Medical Corps mistakenly adopted the Caduceus instead of the true medical emblem.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "The authentic symbol of medicine is the Rod of Asclepius - a single snake wrapped around a rough wooden staff.",
                image: "/caduceus.jpg"
            },
            {
                paragraph: "Despite historical corrections by historians, the Caduceus remains deeply entrenched in commercial medical branding worldwide.",
                image: "/caduceus.jpg"
            }
        ]
    },
];

export default function DailyLearningPage() {
    const [activeCard, setActiveCard] = useState<CardType>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch for client-side theme
    useEffect(() => {
        setMounted(true);
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const bannerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const activeCardConfig = cardsConfig.find(c => c.type === activeCard);

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
                {/* Subtitle Header */}
                <div className="max-w-[110rem] mx-auto mb-16 text-center flex flex-col items-center">
                    <div className="w-12 h-[1px] bg-border mb-6" />
                    <p className="text-foreground/90 text-lg md:text-2xl font-medium tracking-tight max-w-2xl leading-relaxed">
                        Where a simple question turns into a <span className="font-semibold text-foreground">3 AM obsession</span>
                    </p>
                    <div className="w-12 h-[1px] bg-border mt-6" />
                </div>

                {/* Ultra-wide Cards Grid */}
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 w-full max-w-[110rem] mx-auto space-y-8">
                    {cardsConfig.map((card) => (
                        <div
                            key={card.type}
                            onClick={() => setActiveCard(card.type)}
                            className="bg-card border border-border/60 shadow-sm hover:shadow-2xl cursor-pointer hover:border-primary/60 transition-all duration-300 overflow-hidden flex flex-col break-inside-avoid rounded-none group"
                        >
                            <div className="w-full relative overflow-hidden">
                                <Image
                                    src={card.image}
                                    alt={card.title}
                                    width={1200}
                                    height={900}
                                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
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

            {/* Render DeepDiveOverlay directly */}
            {activeCard && activeCardConfig && (
                <DeepDiveOverlay
                    card={activeCardConfig}
                    validatedEntries={validatedEntries}
                    onClose={() => setActiveCard(null)}
                />
            )}
        </main>
    );
}