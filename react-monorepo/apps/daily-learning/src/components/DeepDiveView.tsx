"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LearningEntry, ResourceLink } from "@repo/shared-types";
import { ArrowUpRight, ChevronDown, BookOpen } from "lucide-react";
import RabiesWorldMap from "@/components/RabiesWorldMap";

export interface DeepDiveSection {
    paragraph: string;
    image: string;
    title?: string;
    category?: string;
    datePublished?: string;
}

export interface CardConfig {
    type: string;
    title: string;
    description: string;
    image: string;
    isCustomContent?: boolean;
    sections?: DeepDiveSection[];
    resources?: ResourceLink[];
}

interface DeepDiveViewProps {
    card: CardConfig;
    validatedEntries: LearningEntry[];
    onClose: () => void;
}

export default function DeepDiveView({ card, validatedEntries, onClose }: DeepDiveViewProps) {
    if (!card) return null;

    const [activeIndex, setActiveIndex] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isVaultOpen, setIsVaultOpen] = useState(true);

    // Hydration safety and initial load states
    const [isMounted, setIsMounted] = useState(false);
    const [isFullyLoaded, setIsFullyLoaded] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const hasPlayed = sessionStorage.getItem("dtb_initial_anim_played") === "true";
        if (hasPlayed) {
            setIsFullyLoaded(true);
        }
    }, []);

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

    // Find matching database entry safely
    const matchedEntry = useMemo(() => {
        if (!card) return null;
        return validatedEntries.find(
            (e) =>
                e.slug?.toLowerCase() === card.type.toLowerCase() ||
                e.title?.toLowerCase() === card.title.toLowerCase()
        );
    }, [card, validatedEntries]);

    // Robustly resolve and parse resources from card config or database entry
    const resolvedResources = useMemo(() => {
        let rawResources: unknown = card.resources;

        if (!rawResources || (Array.isArray(rawResources) && rawResources.length === 0)) {
            if (matchedEntry && (matchedEntry as any).resources) {
                rawResources = (matchedEntry as any).resources;
            }
        }

        if (typeof rawResources === "string") {
            try {
                rawResources = JSON.parse(rawResources);
            } catch {
                rawResources = [];
            }
        }

        return Array.isArray(rawResources) ? (rawResources as ResourceLink[]) : [];
    }, [card.resources, matchedEntry]);

    // Memoize slides array
    const slides = useMemo(() => {
        if (!card) return [];

        if (card.isCustomContent && matchedEntry) {
            return [
                {
                    paragraph: matchedEntry.content,
                    image: card.image,
                    title: matchedEntry.title,
                    category: matchedEntry.category,
                    datePublished: matchedEntry.datePublished,
                },
            ];
        }

        if (card.sections && card.sections.length > 0) {
            return card.sections;
        }

        return [{ paragraph: card.description, image: card.image, title: card.title }];
    }, [card, matchedEntry]);

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
    const isFinalSlide = activeIndex === slides.length - 1;
    const showReferences = isFinalSlide && resolvedResources.length > 0;

    const getDomain = (url: string) => {
        try {
            return new URL(url).hostname.replace(/^www\./, "");
        } catch {
            return "";
        }
    };

    return (
        <div
            onScroll={handleScroll}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        >
            {/* Clickable Backdrop Area */}
            <div className="fixed inset-0" onClick={onClose} />

            {/* Main Scrollytelling Container */}
            <div className="relative z-10 w-full max-w-[90rem] mx-auto flex flex-col lg:flex-row min-h-full pointer-events-none">
                {/* Left Side: Sticky Text Pane with Pinned Bottom Vault */}
                <div className="w-full lg:w-5/12 lg:sticky lg:top-0 lg:h-screen flex flex-col justify-between p-8 md:p-12 lg:p-14 pointer-events-auto z-20 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                    {/* Top / Middle Editorial Narrative */}
                    <div className="my-auto py-4">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                            className="flex flex-col gap-5"
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono uppercase tracking-widest text-[#a995c9]">
                                        {card.title}
                                    </span>
                                    {slides.length > 1 && (
                                        <span className="text-xs font-mono text-[#a995c9]/80">
                                            {"[" +
                                                (activeIndex + 1).toString().padStart(2, "0") +
                                                " / " +
                                                slides.length.toString().padStart(2, "0") +
                                                "]"}
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-[#a995c9]">
                                    {currentSlide.title || card.title}
                                </h2>
                            </div>

                            {currentSlide.category && (
                                <div className="flex items-center gap-3 text-xs text-[#a995c9]">
                                    <span className="px-3 py-1 rounded-none bg-[#a995c9]/10 border border-[#a995c9]/20 font-medium tracking-wide">
                                        {currentSlide.category}
                                    </span>
                                    {currentSlide.datePublished && (
                                        <span className="text-[#a995c9]/80">{currentSlide.datePublished}</span>
                                    )}
                                </div>
                            )}

                            <p className="text-lg md:text-xl leading-relaxed text-[#a995c9]/90 font-normal">
                                {currentSlide.paragraph}
                            </p>
                        </motion.div>
                    </div>

                    {/* Bottom Docked References Drawer (Final Slide Only) */}
                    <AnimatePresence>
                        {showReferences && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 12 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="mt-6 pt-4 border-t border-[#a995c9]/30 shrink-0"
                            >
                                <button
                                    type="button"
                                    onClick={() => setIsVaultOpen((prev) => !prev)}
                                    className="w-full flex items-center justify-between py-2 px-3 bg-[#a995c9]/10 hover:bg-[#a995c9]/15 border border-[#a995c9]/30 transition-colors cursor-pointer rounded-none"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <BookOpen className="w-3.5 h-3.5 text-[#a995c9]" />
                                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#a995c9] font-semibold">
                                            References
                                        </span>
                                    </div>
                                    <ChevronDown
                                        className={`w-4 h-4 text-[#a995c9] transition-transform duration-300 ${isVaultOpen ? "rotate-180" : "rotate-0"
                                            }`}
                                    />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isVaultOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-2.5 flex flex-col gap-2 max-h-52 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#a995c9]/30">
                                                {resolvedResources.map((resource, idx) => {
                                                    const domain = getDomain(resource.url);
                                                    return (
                                                        <a
                                                            key={idx}
                                                            href={resource.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="group flex items-start justify-between p-3 bg-zinc-950/70 border border-zinc-800 hover:border-[#a995c9] hover:bg-[#a995c9]/5 transition-all duration-200 rounded-none"
                                                        >
                                                            <div className="flex flex-col pr-3 min-w-0">
                                                                <span className="text-sm font-semibold text-zinc-100 group-hover:text-[#a995c9] transition-colors truncate">
                                                                    {resource.title}
                                                                </span>

                                                                {resource.note && (
                                                                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                                                                        {resource.note}
                                                                    </p>
                                                                )}

                                                                {domain && (
                                                                    <span className="text-[10px] font-mono text-zinc-500 mt-1.5">
                                                                        {domain}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-[#a995c9] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 mt-0.5" />
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Side Wrapper: Scrolling Images + Centered Vertical Progress Bar */}
                <div className="w-full lg:w-7/12 flex items-start px-8 py-16 md:px-16 md:py-20 pointer-events-auto gap-4">
                    {/* Scrolling Image or Custom Widget Column */}
                    <div className="w-full flex flex-col gap-24">
                        {slides.map((slide, index) => {
                            const isFirst = index === 0;
                            const shouldShow = !isMounted || isFirst || isFullyLoaded;

                            return (
                                <motion.div
                                    key={`slide-${index}-${slide.image}`}
                                    ref={(el) => {
                                        imageRefs.current[index] = el;
                                    }}
                                    initial={{ opacity: 0, y: 35 }}
                                    animate={{ opacity: shouldShow ? 1 : 0, y: shouldShow ? 0 : 35 }}
                                    transition={{
                                        duration: 0.7,
                                        ease: "easeOut",
                                        delay: isFirst ? 0 : isFullyLoaded ? 0.2 : 0.6,
                                    }}
                                    className="w-full shrink-0"
                                >
                                    {card.type === "rabies" && isFirst ? (
                                        <motion.div
                                            layoutId={`card-image-${card.type}`}
                                            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                                            onLayoutAnimationComplete={() => {
                                                if (!sessionStorage.getItem("dtb_initial_anim_played")) {
                                                    sessionStorage.setItem("dtb_initial_anim_played", "true");
                                                    setIsFullyLoaded(true);
                                                }
                                            }}
                                            className="w-full h-full"
                                        >
                                            <RabiesWorldMap />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            layoutId={isFirst ? `card-image-${card.type}` : undefined}
                                            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                                            onLayoutAnimationComplete={() => {
                                                if (!sessionStorage.getItem("dtb_initial_anim_played")) {
                                                    sessionStorage.setItem("dtb_initial_anim_played", "true");
                                                    setIsFullyLoaded(true);
                                                }
                                            }}
                                            className="relative w-full h-[65vh] lg:h-[75vh] bg-zinc-900/50 shadow-2xl overflow-hidden rounded-2xl border border-zinc-800/80"
                                        >
                                            <Image
                                                src={slide.image}
                                                alt={slide.title || card.title}
                                                fill
                                                priority={isFirst}
                                                sizes="(max-width: 1024px) 100vw, 60vw"
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Vertically Centered Sticky Progress Bar Track */}
                    <div className="sticky top-[45vh] hidden lg:flex flex-col items-center h-48 w-1 bg-zinc-800/80 rounded-full shrink-0 ml-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isFullyLoaded ? 1 : 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="w-full bg-[#a995c9] rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(169,149,201,0.7)]"
                            style={{ height: `${scrollProgress * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}