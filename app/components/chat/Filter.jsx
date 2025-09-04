import React, { useState } from "react";
import TldrCard from "../ux/TldrCard";

const TAGS = [
    { name: "All", color: "blue", icon: "ri-function-line", iconColor: "text-blue-500" },
    { name: "Note", color: "indigo", icon: "ri-book-2-line", iconColor: "text-indigo-500" },
    { name: "Message", color: "emerald", icon: "ri-chat-3-line", iconColor: "text-emerald-500" },
    { name: "Question", color: "amber", icon: "ri-question-line", iconColor: "text-amber-500" },
    { name: "Summary", color: "rose", icon: "ri-file-list-line", iconColor: "text-rose-500" },
    { name: "TL;DR", color: "cyan", icon: "ri-article-line", iconColor: "text-cyan-500" },
    { name: "Me Too", color: "pink", icon: "+1", iconColor: "text-pink-500" },
];

const BG_COLORS = {
    blue: "bg-blue-100",
    indigo: "bg-indigo-100",
    emerald: "bg-emerald-100",
    amber: "bg-amber-100",
    rose: "bg-rose-100",
    cyan: "bg-cyan-100",
    pink: "bg-pink-100",
};

export default function Filter({ selectedFilter, setSelectedFilter, onTldr, Tldr }) {
    const [tldrActive, setTldrActive] = useState(false);

    return (
        <div className="mb-6">
            <h3 className="font-medium mb-2 flex items-center gap-1">
                <i className="ri-filter-3-line"></i> Filters
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
                {TAGS.map((tag) => {
                    const isSelected =
                        tag.name === "TL;DR" ? tldrActive : selectedFilter === tag.name;

                    const glowColor =
                        tag.color === "indigo"
                            ? "rgba(99,102,241,0.5)"
                            : tag.color === "emerald"
                                ? "rgba(16,185,129,0.5)"
                                : tag.color === "amber"
                                    ? "rgba(245,158,11,0.5)"
                                    : tag.color === "rose"
                                        ? "rgba(244,63,94,0.3)"
                                        : tag.color === "cyan"
                                            ? "rgba(6,182,212,0.5)"
                                            : tag.color === "pink"
                                                ? "rgba(236,72,153,0.5)"
                                                : tag.color === "blue"
                                                    ? "rgba(59,130,246,0.5)"
                                                    : "rgba(0,0,0,0.2)";

                    const handleClick = () => {
                        if (tag.name === "TL;DR") {
                            setTldrActive(true); // highlight TL;DR
                            onTldr();
                            setTimeout(() => setTldrActive(false), 2000); // auto reset after 2s
                        } else {
                            setSelectedFilter(tag.name);
                        }
                    };

                    return (
                        <button
                            key={tag.name}
                            onClick={handleClick}
                            className={`group cursor-pointer relative rounded-full border-2 border-gray-300/50 backdrop-blur-2xl flex items-center gap-1 text-sm font-medium transition-all`}
                            style={{
                                backgroundColor: isSelected ? "" : "rgba(255,255,255,0.1)",
                                boxShadow: isSelected
                                    ? `0 0 12px ${glowColor}`
                                    : "0 0 5px rgba(0,0,0,0.1)",
                                borderColor: isSelected ? glowColor : "rgba(209,213,219,0.5)",
                            }}
                        >
                            <span
                                className={`glass flex items-center py-2 gap-1 h-6 rounded-full px-2 transition group-hover:bg-white/40 group-active:scale-[0.97] ${isSelected ? BG_COLORS[tag.color] : ""
                                    }`}
                            >

                                {tag.name === "Me Too" ? (
                                    <div
                                        className={`flex items-center justify-center w-4 h-4 rounded-full border-2 border-pink-300`}
                                    >
                                        <span className="text-pink-500 text-[9px] font-bold">+1</span>
                                    </div>
                                ) : (
                                    <i className={`${tag.icon} ${tag.iconColor} text-sm`}></i>
                                )}

                                <span className="text-[1.5vh] font-semibold text-gray-800">
                                    {tag.name}
                                </span>
                            </span>
                        </button>
                    );
                })}

                <TldrCard summary={Tldr} />
            </div>
        </div>
    );
}
