"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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
    type: "rabies" | "castrato" | "rat" | "caduceus" | "gravity" | "windchimes" | null;
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
    const [activeIndex, setActiveIndex] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Lock body scroll and set up ESC key listener
    useEffect(() => {
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    // Slide generator including placeholders for Gravity Rooms and Windchimes
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

        // Placeholder content mappings for new topics (easily editable later)
        const lowerTitle = card.title.toLowerCase();
        if (lowerTitle.includes("gravity") || card.type === "gravity") {
            return [
                {
                    title: "Principles of Artificial Gravity",
                    category: "Physics & Engineering",
                    datePublished: "2026",
                    paragraph: "Placeholder text for gravity rooms: Explaining how centripetal acceleration, rotation speeds, and radius dimensions simulate earth-like gravitational forces in enclosed space environments. [Text to be updated later]",
                    image: card.image,
                },
                {
                    title: "Centrifugal Force Mechanics",
                    category: "Structural Design",
                    datePublished: "2026",
                    paragraph: "Placeholder text for rotational dynamics: How the continuous curvature of a cylindrical or toroidal habitat pushes occupants toward the outer hull, creating a stable floor sensation. [Text to be updated later]",
                    image: card.image,
                },
                {
                    title: "Coriolis Effects & Human Adaptation",
                    category: "Human Factors",
                    datePublished: "2026",
                    paragraph: "Placeholder text for physiological impacts: Managing inner ear adjustments, fluid shifts, and rotational side effects during rapid movement inside artificial gravity structures. [Text to be updated later]",
                    image: card.image,
                }
            ];
        }

        if (lowerTitle.includes("windchime") || card.type === "windchimes") {
            return [
                {
                    title: "Acoustic Resonance & Materials",
                    category: "Acoustic Design",
                    datePublished: "2026",
                    paragraph: "Placeholder text for windchimes: Exploring how varying tube lengths, wall thickness, and alloy compositions dictate fundamental frequencies and harmonic overtones. [Text to be updated later]",
                    image: card.image,
                },
                {
                    title: "Kinetic Energy & Clapper Dynamics",
                    category: "Mechanical Response",
                    datePublished: "2026",
                    paragraph: "Placeholder text for wind capture: How suspended center clappers and wind-catching sails translate unpredictable air currents into rhythmic melodic sequences. [Text to be updated later]",
                    image: card.image,
                },
                {
                    title: "Pentatonic Tuning & Soundscapes",
                    category: "Musical Architecture",
                    datePublished: "2026",
                    paragraph: "Placeholder text for scale tuning: Designing sonic intervals that eliminate dissonant clashing to generate calming, ambient outdoor auditory environments. [Text to be updated later]",
                    image: card.image,
                }
            ];
        }

        return [{ paragraph: card.description, image: card.image, title: card.title }];
    })();

    // Handle scroll progress calculation manually
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const totalHeight = target.scrollHeight - target.clientHeight;
        if (totalHeight > 0) {
            const progress = target.scrollTop / totalHeight;
            setScrollProgress(progress);
        }
    };

    // Scroll trigger observer to switch active text content per slide image
    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        imageRefs.current.forEach((el, index) => {
            if (!el) return;
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setActiveIndex(index);
                        }
                    });
                },
                { threshold: 0.5 }
            );
            observer.observe(el);
            observers.push(observer);
        });

        return () => {
            observers.forEach((obs) => obs.disconnect());
        };
    }, [slides.length]);

    const currentSlide = slides[activeIndex] || slides[0];

    return (
        <div
            onScroll={handleScroll}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        >
            {/* Clickable Backdrop Area */}
            <div className="fixed inset-0" onClick={onClose} />

            {/* Main Scrollytelling Container */}
            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row min-h-full pointer-events-none">

                {/* Left Side: Sticky Text Pane with Animated Crossfade */}
                <div className="w-full lg:w-5/12 lg:sticky lg:top-0 lg:h-screen flex flex-col justify-center p-8 md:p-12 lg:p-16 pointer-events-auto z-20">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex flex-col gap-6"
                    >
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                                    {card.title}
                                </span>
                                {slides.length > 1 && (
                                    <span className="text-xs font-mono text-zinc-500">
                                        {"[" + (activeIndex + 1).toString().padStart(2, "0") + " / " + slides.length.toString().padStart(2, "0") + "]"}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
                                {currentSlide.title || card.title}
                            </h2>
                        </div>

                        {currentSlide.category && (
                            <div className="flex items-center gap-3 text-xs text-zinc-400">
                                <span className="px-3 py-1 rounded-none bg-white/10 text-white font-medium tracking-wide">
                                    {currentSlide.category}
                                </span>
                                {currentSlide.datePublished && <span className="text-zinc-400">{currentSlide.datePublished}</span>}
                            </div>
                        )}

                        <p className="text-lg md:text-xl leading-relaxed text-zinc-300 font-normal">
                            {currentSlide.paragraph}
                        </p>
                    </motion.div>
                </div>

                {/* Right Side Wrapper: Scrolling Images + Centered Vertical Progress Bar */}
                <div className="w-full lg:w-7/12 flex items-start p-8 md:p-12 lg:p-16 pointer-events-auto gap-4">

                    {/* Scrolling Image Column */}
                    <div className="w-full flex flex-col gap-24">
                        {slides.map((slide, index) => (
                            <motion.div
                                key={index}
                                ref={(el) => { imageRefs.current[index] = el; }}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="relative w-full h-[65vh] lg:h-[75vh] bg-zinc-900/50 shadow-2xl overflow-hidden shrink-0"
                            >
                                <Image
                                    src={slide.image}
                                    alt={slide.title || card.title}
                                    fill
                                    priority={index === 0}
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none" />
                            </motion.div>
                        ))}
                    </div>

                    {/* Vertically Centered Sticky Progress Bar Track */}
                    <div className="sticky top-[45vh] hidden lg:flex flex-col items-center h-48 w-1 bg-zinc-800/80 rounded-full shrink-0 ml-6">
                        <div
                            className="w-full bg-white rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                            style={{ height: `${scrollProgress * 100}%` }}
                        />
                    </div>

                </div>

            </div>
        </div>
    );
}