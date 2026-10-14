"use client";

import { useState } from "react";
import { LearningEntry, LearningEntrySchema } from '@repo/shared-types';
import Image from "next/image";
import DeepDiveOverlay, { CardConfig } from "@/components/DeepDiveView";

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

type CardType = "rabies" | "castrato" | "rat" | "caduceus" | null;

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
];

export default function DailyLearningPage() {
    const [activeCard, setActiveCard] = useState<CardType>(null);

    const activeCardConfig = cardsConfig.find(c => c.type === activeCard);

    return (
        <div className="min-h-screen w-full flex flex-col">
            {/* Hero Section */}
            <div className="relative w-full h-64 md:h-180 overflow-hidden shadow-lg">
                <Image src="/banner.jpg" alt="Banner" fill priority className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Down the Burrow</h1>
                    <p className="text-zinc-200 mt-2 max-w-2xl text-base md:text-lg">Where a simple question turns into a 3 AM obsession</p>
                </div>
            </div>

            {/* Masonry Column Grid */}
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

            {/* Interactive Expanding Overlay Component */}
            {activeCard && activeCardConfig && (
                <DeepDiveOverlay
                    card={activeCardConfig}
                    validatedEntries={validatedEntries}
                    onClose={() => setActiveCard(null)}
                />
            )}
        </div>
    );
}