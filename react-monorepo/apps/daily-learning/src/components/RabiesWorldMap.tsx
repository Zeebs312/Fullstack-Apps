"use client";

import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const freeCountries = [
    "Japan", "Germany", "United Kingdom", "France", "Italy", "Indonesia", "Spain", "Morocco", "Australia",
    "Netherlands", "Belgium", "Sweden", "Czechia", "Portugal", "Greece", "Austria", "Switzerland", "Hong Kong",
    "Bulgaria", "Denmark", "Singapore", "Norway", "Finland", "Ireland", "New Zealand", "Croatia", "Lithuania",
    "Slovenia", "Latvia", "Bahrain", "Cyprus", "Estonia", "Fiji", "Reunion", "Solomon Islands", "Macau",
    "Luxembourg", "Malta", "Cape Verde", "Brunei", "Iceland", "Vanuatu", "New Caledonia", "French Polynesia",
    "Samoa", "Guam", "Kiribati", "Micronesia", "Tonga", "Andorra", "Faroe Islands", "Gibraltar", "Liechtenstein",
    "Marshall Islands", "San Marino", "Palau", "Nauru", "Tuvalu", "Falkland Islands"
];

export default function RabiesWorldMap() {
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

    const activeCountry = hoveredCountry || selectedCountry;
    const isEndemicActive = activeCountry ? !freeCountries.includes(activeCountry) : null;

    return (
        <div className="relative w-full h-full min-h-[500px] bg-zinc-950 flex flex-col justify-between p-6 overflow-hidden rounded-2xl border border-zinc-800/80 shadow-2xl">

            {/* Background Ambient Glow & Grid Accent */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,rgba(168,85,247,0.12),rgba(9,9,11,0))]" />
            <div
                className="absolute inset-0 opacity-[0.15] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
                    backgroundSize: `24px 24px`
                }}
            />

            {/* Top Glassmorphic HUD Header */}
            <div className="absolute top-6 left-6 z-20 flex flex-col gap-1.5 bg-zinc-900/60 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-xl shadow-2xl max-w-sm transition-all duration-300">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
                            Global Surveillance Map
                        </span>
                    </div>

                    {selectedCountry && (
                        <button
                            onClick={() => setSelectedCountry(null)}
                            className="text-[10px] font-mono text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider underline cursor-pointer"
                        >
                            Reset Selection
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2.5 mt-0.5">
                    <p className="text-base font-semibold text-white tracking-tight">
                        {activeCountry || "Global Overview"}
                    </p>
                    {activeCountry && (
                        <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isEndemicActive
                                    ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                }`}
                        >
                            {isEndemicActive ? "High Risk / Endemic" : "Controlled Region"}
                        </span>
                    )}
                </div>
            </div>

            {/* Stationary Vector Map Canvas */}
            <div className="w-full h-full flex items-center justify-center relative z-10">
                <ComposableMap
                    projection="geoEqualEarth"
                    projectionConfig={{ scale: 165, center: [0, 12] }}
                    className="w-full h-full filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const countryName = geo.properties.name;
                                const isEndemic = !freeCountries.includes(countryName);
                                const isSelected = selectedCountry === countryName;

                                // Color Palette
                                let strokeColor = "#27272a";
                                let strokeWidth = 0.4;
                                let fillColor = "#18181b"; // Default non-endemic background

                                if (isEndemic) {
                                    fillColor = "#9333ea"; // Vibrant Purple for Endemic
                                }

                                if (isSelected) {
                                    fillColor = "#c084fc";
                                    strokeColor = "#ffffff";
                                    strokeWidth = 1.5;
                                }

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={fillColor}
                                        stroke={strokeColor}
                                        strokeWidth={strokeWidth}
                                        onClick={() => setSelectedCountry(countryName)}
                                        onMouseEnter={() => setHoveredCountry(countryName)}
                                        onMouseLeave={() => setHoveredCountry(null)}
                                        style={{
                                            default: {
                                                fill: fillColor,
                                                outline: "none",
                                                transition: "all 250ms ease",
                                            },
                                            hover: {
                                                fill: isEndemic ? "#a855f7" : "#3f3f46",
                                                stroke: "#a1a1aa",
                                                strokeWidth: 0.8,
                                                outline: "none",
                                                cursor: "pointer",
                                            },
                                            pressed: {
                                                fill: "#7e22ce",
                                                outline: "none",
                                            },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ComposableMap>
            </div>

            {/* Bottom Modern Glass Legend */}
            <div className="absolute bottom-6 left-6 z-20 hidden sm:flex items-center gap-6 bg-zinc-900/60 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-xl shadow-2xl">
                <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                    <span className="text-xs font-mono text-zinc-300">Endemic Focus</span>
                </div>
                <div className="w-[1px] h-3 bg-zinc-800" />
                <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
                    <span className="text-xs font-mono text-zinc-400">Rabies Free / Controlled</span>
                </div>
            </div>

        </div>
    );
}