"use client";
import React from "react";
import Image from "next/image";
import { motion, useAnimationFrame } from "framer-motion";

const TAGS = [
    { name: "All", color: "blue", icon: "ri-function-line", iconColor: "text-blue-500" },
    { name: "Note", color: "indigo", icon: "ri-book-2-line", iconColor: "text-indigo-500" },
    { name: "Message", color: "emerald", icon: "ri-chat-3-line", iconColor: "text-emerald-500" },
    { name: "Question", color: "amber", icon: "ri-question-line", iconColor: "text-amber-500" },
    { name: "Summary", color: "rose", icon: "ri-file-list-line", iconColor: "text-rose-500" },
];

export default function NoCampusSelected() {
    const radius = 160; // distance from center
    const [angle, setAngle] = React.useState(0);

    // Animate continuous orbit
    useAnimationFrame(() => {
        setAngle((prev) => (prev + 0.2) % 360); // adjust 0.2 for speed
    });

    return (
        <div className="flex-1 flex items-center justify-center relative h-[500px]">
            {/* Campus Logo */}
            <div className="relative w-32 h-32 z-10">
                <Image
                    src="https://res.cloudinary.com/du7hdis4n/image/upload/v1756734304/campus/campus.png"
                    alt="Campus Logo"
                    fill
                    className="object-contain rounded-full"
                />
            </div>

            {/* Orbiting Tags */}
            {TAGS.map((tag, index) => {
                const step = (index / TAGS.length) * 2 * Math.PI; // evenly spaced
                const currentAngle = (angle * Math.PI) / 180 + step;
                const x = radius * Math.cos(currentAngle);
                const y = radius * Math.sin(currentAngle);

                return (
                    <motion.button
                        key={tag.name}
                        className={`absolute bg-white/10 backdrop-blur-2xl rounded-full border-2 border-gray-300/50 flex items-center gap-2 px-4 py-1 shadow-lg`}
                        style={{
                            top: "50%",
                            left: "10%",
                            transform: "translate(-50%, -50%)",
                            boxShadow: `0 0 10px ${tag.color === "indigo"
                                ? "rgba(99,102,241,0.4)"
                                : tag.color === "emerald"
                                    ? "rgba(16,185,129,0.4)"
                                    : tag.color === "amber"
                                        ? "rgba(245,158,11,0.4)"
                                        : tag.color === "rose"
                                            ? "rgba(244,63,94,0.2)"
                                            : tag.color === "blue"
                                                ? "rgba(59,130,246,0.5)"
                                                : "rgba(0,0,0,0.2)"
                                }`,
                        }}
                        animate={{ x, y }}
                        transition={{ type: "tween", ease: "linear", duration: 0.05 }} // smoother orbit
                    >
                        <i className={`${tag.icon} ${tag.iconColor} text-base`} />
                        <span className="text-sm font-medium text-gray-800">{tag.name}</span>
                    </motion.button>
                );
            })}
        </div>
    );
}
