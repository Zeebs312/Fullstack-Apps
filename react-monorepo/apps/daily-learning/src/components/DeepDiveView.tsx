"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useVelocity } from "framer-motion";
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

// Helper to chunk text into uniform max-length columns to prevent overflow (set to 24)
function chunkText(text: string, maxChars: number = 24) {
    if (!text) return [];
    const words = text.split(" ");
    const chunks: string[] = [];
    let currentChunk = "";

    for (const word of words) {
        if ((currentChunk + " " + word).trim().length <= maxChars) {
            currentChunk = currentChunk ? currentChunk + " " + word : word;
        } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = word;
        }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
}

// Sub-component for individual fluid characters with velocity-boosted wave amplitude
function SheetChar({
    char,
    charIdx,
    pullX,
    velocityFactor,
    isActive,
}: {
    char: string;
    charIdx: number;
    pullX: any;
    velocityFactor: any;
    isActive: boolean;
}) {
    const depthMultiplier = useTransform(velocityFactor, (v: number) => (0.4 + charIdx * 0.16) * Math.max(1, v * 1.5));

    const charSpring = useSpring(
        useTransform([pullX, depthMultiplier], ([val, mult]: [number, number]) => (isActive ? val * mult : 0)),
        {
            damping: useTransform(velocityFactor, (v: number) => Math.max(6, 22 - v * 6)),
            stiffness: useTransform(velocityFactor, (v: number) => Math.min(320, 80 + v * 90)),
            mass: 0.6 + charIdx * 0.1,
        }
    );

    return (
        <motion.span
            style={{ x: charSpring }}
            className={`inline-block text-xs font-mono tracking-widest uppercase transition-colors origin-left ${isActive ? "text-white" : "text-zinc-400"
                }`}
        >
            {char === " " ? "\u00A0" : char}
        </motion.span>
    );
}

// Sub-component for strictly isolated, single-active windchime columns
function SheetWindChimeColumn({
    chunk,
    columnIndex,
    activeColumnIndex,
    setActiveColumnIndex,
    mouseX,
    globalMouseX,
}: {
    chunk: string;
    columnIndex: number;
    activeColumnIndex: number | null;
    setActiveColumnIndex: (idx: number | null) => void;
    mouseX: any;
    globalMouseX: any;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const elementCenter = useRef(0);

    const mouseVelocity = useVelocity(globalMouseX);
    const velocityFactor = useTransform(mouseVelocity, (v: number) => Math.min(Math.max(Math.abs(v) / 300, 0.4), 3.5));

    const updateCenter = () => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            elementCenter.current = rect.left + rect.width / 2;
        }
    };

    useEffect(() => {
        updateCenter();
        window.addEventListener("resize", updateCenter);
        return () => window.removeEventListener("resize", updateCenter);
    }, []);

    useEffect(() => {
        return globalMouseX.onChange((x: number) => {
            updateCenter();
            const distance = Math.abs(x - elementCenter.current);

            if (distance < 30) {
                setActiveColumnIndex(columnIndex);
            } else if (activeColumnIndex === columnIndex && distance > 55) {
                setActiveColumnIndex(null);
            }
        });
    }, [globalMouseX, columnIndex, activeColumnIndex, setActiveColumnIndex]);

    const isActive = activeColumnIndex === columnIndex;

    const handleMouseEnter = (e: React.MouseEvent) => {
        updateCenter();
        mouseX.set(e.clientX);
        setActiveColumnIndex(columnIndex);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        mouseX.set(e.clientX);
    };

    const handleMouseLeave = () => {
        if (activeColumnIndex === columnIndex) {
            setActiveColumnIndex(null);
        }
        mouseX.set(elementCenter.current);
    };

    const rawPullX = useTransform(mouseX, (x: number) => (isActive ? x - elementCenter.current : 0));
    const baseSpring = useSpring(rawPullX, { damping: 12, stiffness: 130, mass: 0.7 });

    const chars = chunk.split("");

    return (
        <motion.div
            ref={ref}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: baseSpring }}
            className="flex flex-col items-center shrink-0 cursor-grab active:cursor-grabbing group origin-top py-2 px-2"
        >
            {/* Vertical Character Sheet Stack */}
            <div className="flex flex-col items-start gap-1 bg-transparent px-2 py-1">
                {chars.map((char, charIdx) => (
                    <SheetChar
                        key={charIdx}
                        char={char}
                        charIdx={charIdx}
                        pullX={baseSpring}
                        velocityFactor={velocityFactor}
                        isActive={isActive}
                    />
                ))}
            </div>

            {/* Bottom Striker Weight */}
            <div
                className={`w-2.5 h-2.5 mt-1.5 transition-colors rounded-none ${isActive
                    ? "bg-zinc-100 shadow-[0_0_10px_rgba(244,244,245,0.5)]"
                    : "bg-zinc-400"
                    }`}
            />
        </motion.div>
    );
}

export default function DeepDiveView({ card, validatedEntries, onClose }: DeepDiveViewProps) {
    if (!card) return null;

    const [activeIndex, setActiveIndex] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isVaultOpen, setIsVaultOpen] = useState(false); // Set to false to keep references closed by default
    const [activeColumnIndex, setActiveColumnIndex] = useState<number | null>(null);

    const mouseX = useMotionValue(0);
    const globalMouseX = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        mouseX.set(e.clientX);
        globalMouseX.set(e.clientX);
    };

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

    const matchedEntry = useMemo(() => {
        if (!card) return null;
        return validatedEntries.find(
            (e) =>
                e.slug?.toLowerCase() === card.type.toLowerCase() ||
                e.title?.toLowerCase() === card.title.toLowerCase()
        );
    }, [card, validatedEntries]);

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

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const totalHeight = target.scrollHeight - target.clientHeight;
        if (totalHeight > 0) {
            const progress = target.scrollTop / totalHeight;
            setScrollProgress(progress);
        }
    };

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

    const isWindchimes =
        card.type?.toLowerCase().includes("windchime") ||
        card.title?.toLowerCase().includes("windchime") ||
        currentSlide.title?.toLowerCase().includes("windchime");

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
            onMouseMove={handleMouseMove}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl overflow-y-auto py-3 md:py-4 lg:py-5 px-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        >
            {/* Clickable Backdrop Area */}
            <div className="fixed inset-0 -z-10" onClick={onClose} />

            {/* Main Scrollytelling Container */}
            <div className="relative z-10 w-full flex flex-col lg:flex-row min-h-full pointer-events-none">
                {/* Left Side: Sticky Text Pane */}
                <div className="w-full lg:w-4/12 lg:sticky lg:top-0 lg:h-[calc(100vh-2rem)] flex flex-col justify-between px-6 md:px-10 lg:px-12 py-3 pointer-events-auto z-20 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                    {/* Top / Left Editorial Narrative */}
                    <div className="flex flex-col justify-start py-1">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                            className="flex flex-col items-start text-left gap-3"
                        >
                            <div className="flex flex-col gap-1.5">
                                <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-[1.2] text-white">
                                    {currentSlide.title || card.title}
                                </h2>
                            </div>

                            {currentSlide.datePublished && (
                                <div className="text-xs font-mono text-zinc-400 tracking-wider">
                                    {currentSlide.datePublished}
                                </div>
                            )}

                            {isWindchimes ? (
                                /* Strictly exclusive single-active windchime columns (24 char limit) */
                                <div className="flex flex-row flex-wrap items-start gap-6 py-2 w-full">
                                    {chunkText(currentSlide.paragraph, 24).map((chunk, cIdx) => (
                                        <SheetWindChimeColumn
                                            key={cIdx}
                                            chunk={chunk}
                                            columnIndex={cIdx}
                                            activeColumnIndex={activeColumnIndex}
                                            setActiveColumnIndex={setActiveColumnIndex}
                                            mouseX={mouseX}
                                            globalMouseX={globalMouseX}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <motion.p className="text-sm md:text-base leading-relaxed text-zinc-300 font-normal">
                                    {currentSlide.paragraph}
                                </motion.p>
                            )}
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
                                className="mt-2 pt-2 border-t border-zinc-800 shrink-0"
                            >
                                <button
                                    type="button"
                                    onClick={() => setIsVaultOpen((prev) => !prev)}
                                    className="w-full flex items-center justify-between py-2 px-3 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer rounded-none"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <BookOpen className="w-3.5 h-3.5 text-white" />
                                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-white font-semibold">
                                            References
                                        </span>
                                    </div>
                                    <ChevronDown
                                        className={`w-4 h-4 text-white transition-transform duration-300 ${isVaultOpen ? "rotate-180" : "rotate-0"
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
                                            <div className="pt-2 flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-zinc-700">
                                                {resolvedResources.map((resource, idx) => {
                                                    const domain = getDomain(resource.url);
                                                    return (
                                                        <a
                                                            key={idx}
                                                            href={resource.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="group flex items-start justify-between p-2.5 bg-zinc-950/70 border border-zinc-800 hover:border-white hover:bg-white/5 transition-all duration-200 rounded-none"
                                                        >
                                                            <div className="flex flex-col pr-3 min-w-0">
                                                                <span className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors truncate">
                                                                    {resource.title}
                                                                </span>

                                                                {resource.note && (
                                                                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                                                                        {resource.note}
                                                                    </p>
                                                                )}

                                                                {domain && (
                                                                    <span className="text-[10px] font-mono text-zinc-500 mt-1">
                                                                        {domain}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 mt-0.5" />
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

                {/* Right Side Wrapper: Scrolling Images with Symmetric Padding */}
                <div className="w-full lg:w-8/12 flex items-start pointer-events-auto">
                    <div className="w-full flex flex-col gap-8 lg:gap-12 py-6 pr-6 md:pr-8 lg:pr-8 pl-0 md:pl-0 lg:pl-0">
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
                                            className="w-full h-[75vh]"
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
                                            className="relative w-full aspect-[16/10] bg-zinc-900/50 shadow-2xl overflow-hidden rounded-none border border-zinc-800/80"
                                        >
                                            <Image
                                                src={slide.image}
                                                alt={slide.title || card.title}
                                                fill
                                                priority={isFirst}
                                                sizes="(max-width: 1024px) 100vw, 67vw"
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}