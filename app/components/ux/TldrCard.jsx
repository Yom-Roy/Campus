"use client";
import React from "react";

export default function TldrCard({ summary }) {
    if (!summary) return null;

    return (
        <div className="mt-4 p-4 rounded-2xl border border-cyan-200/60 bg-white/40 backdrop-blur-lg shadow-md relative">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <i className="ri-article-line text-cyan-500 text-lg"></i>
                <h4 className="font-semibold text-cyan-700">TL;DR (AI Summary)</h4>
            </div>

            {/* Body */}
            <p className="text-gray-700 font-semibold text-sm leading-relaxed whitespace-pre-line">
                {summary}
            </p>

            {/* Glow border effect */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none border border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]"></div>
        </div>
    );
}
