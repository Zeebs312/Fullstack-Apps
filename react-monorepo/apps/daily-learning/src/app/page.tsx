"use client";

import { useState } from "react";
import { LearningEntry, LearningEntrySchema } from '@repo/shared-types';
import { cn } from "ui/lib/utils";
import Image from "next/image";
import { X } from "lucide-react";

// Mock data validated against our shared Zod schema
const initialEntries: LearningEntry[] = [
    {
        id: '1',
        title: 'Configuring pnpm Workspaces & Monorepos',
        category: 'DevOps',
        content: 'Learned how to properly link packages using workspace:* protocols and debug workspace resolution errors when package.json filenames matter.',
        datePublished: '2026-10-04',
    },
    {
        id: '2',
        title: 'Next.js 16 App Router & Server Components',
        category: 'Frontend',
        content: 'Exploring server-first architecture and shared Zod validation schemas across fullstack monorepos.',
        datePublished: '2026-10-03',
    },
];

// Validate entries at runtime to ensure data integrity
const validatedEntries = initialEntries.map((entry) => LearningEntrySchema.parse(entry));

type CardType = "rabies" | "castrato" | "rat" | "caduceus" | null;

interface CardConfig {
    type: CardType;
    title: string;
    description: string;
    image: string;
    isCustomContent?: boolean;
}

const cardsConfig: CardConfig[] = [
    {
        type: "rabies",
        title: "Rabies",
        description: "The historical progression, behavioral impact, and pathology of the rabies virus.",
        image: "/rabies.jpg", 
        isCustomContent: true,
    },
    {
        type: "castrato",
        title: "The Castrato",
        image: "/castrato.jpg",
        description: "Explore the fascinating and haunting history of opera's legendary soprano-range male vocalists.",
    },
    {
        type: "rat",
        title: "Rat Evolution",
        image: "/rats.jpg",
        description: "An evolutionary deep dive into how rodents adapted to become one of the most successful species on Earth.",
    },
    {
        type: "caduceus",
        title: "Caduceus",
        image: "/caduceus.jpg",
        description: "isjapslkf",
    },
];

export default function DailyLearningPage() {
    const [activeCard, setActiveCard] = useState<CardType>(null);

    return (
        <div className="min-h-screen w-full flex flex-col">

            {/* Edge-to-Edge Hero Banner */}
            <div className="relative w-full h-64 md:h-180 overflow-hidden shadow-lg">
                <Image
                    src="/banner.jpg"
                    alt="Daily Learning Banner"
                    fill
                    priority
                    className="object-cover"
                />

                {/* Gradient Overlay & Title Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        Down the Burrow
                    </h1>
                    <p className="text-zinc-200 mt-2 max-w-2xl text-base md:text-lg">
                        Where a simple question turns into a 3 AM obsession
                    </p>
                </div>
            </div>

            {/* Masonry Column Container */}
            <div className="w-full px-4 md:px-8 py-8">
                <div className="columns-1 md:columns-3 gap-6 w-full space-y-6">
                    {cardsConfig.map((card) => (
                        <div
                            key={card.type}
                            onClick={() => setActiveCard(card.type)}
                            className="bg-card border shadow-sm cursor-pointer hover:border-primary/50 transition-all hover:shadow-md overflow-hidden flex flex-col break-inside-avoid"
                        >
                            <Image
                                src={card.image}
                                alt={card.title}
                                width={600}
                                height={450}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Interactive Modal Popup */}
            {activeCard && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card text-card-foreground w-full max-w-2xl p-6 md:p-8 rounded-2xl border shadow-2xl relative flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">

                        {/* Close Button */}
                        <button
                            onClick={() => setActiveCard(null)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Modal Content Based on Active Card */}
                        {activeCard === "rabies" && (
                            <>
                                <h2 className="text-2xl font-bold">Rabies</h2>
                                <p className="text-sm text-muted-foreground">Loaded securely from `@repo/shared-types` schema.</p>
                                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                                    {validatedEntries.map((entry) => (
                                        <div key={entry.id} className="p-4 rounded-lg border bg-background flex flex-col gap-1">
                                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">{entry.category}</span>
                                                <span>{entry.datePublished}</span>
                                            </div>
                                            <h3 className="font-semibold text-base">{entry.title}</h3>
                                            <p className="text-sm text-muted-foreground">{entry.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeCard === "castrato" && (
                            <>
                                <h2 className="text-2xl font-bold">The Castrato</h2>
                                <p className="text-sm text-muted-foreground">Explore the fascinating and haunting history of opera's legendary soprano-range male vocalists.</p>
                                <div className="h-48 rounded border border-dashed flex items-center justify-center text-sm text-muted-foreground">
                                    Deep dive article and notes go here.
                                </div>
                            </>
                        )}

                        {activeCard === "rat" && (
                            <>
                                <h2 className="text-2xl font-bold">Rat Evolution</h2>
                                <p className="text-sm text-muted-foreground">An evolutionary deep dive into how rodents adapted to become one of the most successful species on Earth.</p>
                                <div className="h-48 rounded border border-dashed flex items-center justify-center text-sm text-muted-foreground">
                                    Deep dive article and notes go here.
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setActiveCard(null)}
                                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}