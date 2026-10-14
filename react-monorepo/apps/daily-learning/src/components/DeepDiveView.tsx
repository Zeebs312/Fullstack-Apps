"use client";

import { useEffect } from "react";
import Image from "next/image";
import { cn } from "ui/lib/utils";
import { LearningEntry } from "@repo/shared-types";

export interface DeepDiveSection {
    paragraph: string;
    image: string;
    title?: string;
    category?: string;
    datePublished?: string;
}

export interface CardConfig {
    type: "rabies" | "castrato" | "rat" | "caduceus" | null;
    title: string;
    description: string;
    image: string;
    isCustomContent?: boolean;
    sections?: DeepDiveSection[];
}

interface DeepDiveViewProps {
    card: CardConfig;
    validatedEntries: LearningEntry[];
    onClose: () => void;
}

export default function DeepDiveView({ card, validatedEntries, onClose }: DeepDiveViewProps) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const slides = (() => {
        if (card.isCustomContent) {
            return validatedEntries.map((entry) => ({
                paragraph: entry.content,
                image: card.image,
                title: entry.title,
                category: entry.category,
                datePublished: entry.datePublished,
            }));
        }
        if (card.sections && card.sections.length > 0) {
            return card.sections;
        }
        return [{ paragraph: card.description, image: card.image }];
    })();

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md overflow-y-auto">
            {/* Clickable Backdrop Area Covering Everything */}
            <div className="fixed inset-0" onClick={onClose} />

            {/* Scrollable Content Wrapper */}
            <div className="relative z-10 min-h-full w-full flex justify-center p-4 lg:p-12 pointer-events-none">
                <div className="w-full max-w-4xl flex flex-col gap-6 pointer-events-auto my-auto">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={cn(
                                "bg-card text-card-foreground border shadow-2xl flex flex-col lg:flex-row overflow-hidden rounded-none",
                                "w-full min-h-[420px]"
                            )}
                        >
                            <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col justify-between">
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {card.title} {slides.length > 1 && "- Part " + (index + 1) + " of " + slides.length}
                                        </span>
                                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                                            {slide.title || card.title}
                                        </h2>
                                    </div>

                                    {slide.category && (
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="px-2.5 py-1 rounded bg-primary/10 text-primary font-medium">
                                                {slide.category}
                                            </span>
                                            {slide.datePublished && <span>{slide.datePublished}</span>}
                                        </div>
                                    )}

                                    <p className="text-base md:text-lg leading-relaxed text-foreground/90 font-normal">
                                        {slide.paragraph}
                                    </p>
                                </div>
                            </div>

                            <div className="hidden lg:block lg:w-1/2 relative bg-muted min-h-[300px]">
                                <Image
                                    src={slide.image}
                                    alt={slide.title || card.title}
                                    fill
                                    priority={index === 0}
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}