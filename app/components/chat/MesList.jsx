"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MessageCircleReply } from "lucide-react";
import Link from "next/link";

const TAG_COLORS = {
    Note: "border-indigo-500 bg-indigo-100 text-indigo-800",
    Message: "border-emerald-500 bg-emerald-100 text-emerald-800",
    Question: "border-amber-500 bg-amber-100 text-amber-800",
    Summary: "border-rose-500 bg-rose-100 text-rose-800",
    Private: "border-red-500 bg-red-100 text-red-800",
    Global: "border-blue-500 bg-blue-100 text-blue-800",
    Campus: "border-blue-500 bg-blue-100 text-blue-800",
};

const TAG_ICONS = {
    Note: "ri-book-2-line",
    Message: "ri-chat-3-line",
    Question: "ri-question-line",
    Summary: "ri-file-list-line",
    Private: "ri-lock-2-line",
    Global: "ri-earth-line",
};

export default function MesList({
    messages = [],
    user,
    selectedCampus,
    scrollContainerRef,
    onReply,
    setMessages
}) {
    const [swipeData, setSwipeData] = useState({});
    const [isMobile, setIsMobile] = useState(false);

    const safeMessages = Array.isArray(messages) ? messages : [];
    const messagesEndRef = useRef(null)
    const [meTooState, setMeTooState] = useState({});
    const [Mid, setMid] = useState()


    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };
        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
        return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    const handleReplyClick = (message) => {
        if (onReply) onReply(message);
    };

    const handleSwipeStart = (e, mid) => {
        if (e.type === "touchstart") {
            setSwipeData((prev) => ({
                ...prev,
                [mid]: {
                    startX: e.touches[0].clientX,
                    currentX: e.touches[0].clientX,
                    isSwiping: true,
                },
            }));
        }
    };

    const handleSwipeMove = (e, mid) => {
        if (!swipeData[mid]?.isSwiping) return;
        if (e.type === "touchmove") {
            const currentX = e.touches[0].clientX;
            setSwipeData((prev) => ({
                ...prev,
                [mid]: { ...prev[mid], currentX },
            }));
        }
    };

    const handleSwipeEnd = (e, mid, message) => {
        if (!swipeData[mid]?.isSwiping) return;
        const { startX, currentX } = swipeData[mid];
        const deltaX = currentX - startX;

        // Swipe left to reply
        if (e.type === "touchend" && deltaX < -50) {
            handleReplyClick(message);
        }

        setSwipeData((prev) => ({
            ...prev,
            [mid]: { ...prev[mid], isSwiping: false, startX: 0, currentX: 0 },
        }));
    };

    const handleDoubleClick = (message) => {
        if (!isMobile) {
            handleReplyClick(message);
        }
    };

    const getSwipeOffset = (mid) => {
        if (!swipeData[mid]?.isSwiping) return 0;
        const { startX, currentX } = swipeData[mid];
        return Math.min(0, currentX - startX);
    };


    const [hasScrolledInitially, setHasScrolledInitially] = useState(false);

    useEffect(() => {
        if (messagesEndRef.current && !hasScrolledInitially && safeMessages.length > 0) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" }); // first time = instant
            setHasScrolledInitially(true);
        }
    }, [safeMessages, hasScrolledInitially]);

    // reset when campus changes
    useEffect(() => {
        setHasScrolledInitially(false);
    }, [selectedCampus?.cid]);



    const handleReaction = async (mid) => {
        if (!mid) {
            console.warn("handleReaction: no mid provided");
            return;
        }
        if (!user?.uid) {
            console.warn("handleReaction: no userId available");
            return;
        }

        // Prevent double reaction
        if (meTooState[mid]) return;

        // Optimistic UI update
        setMessages((prev) =>
            prev.map((msg) =>
                msg.mid === mid
                    ? { ...msg, meTooCount: (msg.meTooCount || 0) + 1 }
                    : msg
            )
        );
        setMeTooState((prev) => ({ ...prev, [mid]: true }));

        try {
            const res = await fetch("/api/ms/me-too", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mid, userId: user.uid }),
            });
            const data = await res.json();

            if (!res.ok || data.error) {
                console.error("[ME_TOO_ERROR]", data.error || "Unknown error");

                // rollback UI
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.mid === mid
                            ? { ...msg, meTooCount: (msg.meTooCount || 1) - 1 }
                            : msg
                    )
                );
                setMeTooState((prev) => ({ ...prev, [mid]: false }));
            }
        } catch (err) {
            console.error("[ME_TOO_ERROR]", err);

            // rollback UI
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.mid === mid
                        ? { ...msg, meTooCount: (msg.meTooCount || 1) - 1 }
                        : msg
                )
            );
            setMeTooState((prev) => ({ ...prev, [mid]: false }));
        }
    };







    return (
        <div className="flex-1">
            {/* Campus description bubble */}
            {selectedCampus?.description && (
                <motion.div
                    key={`campus-desc-${selectedCampus.cid}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center mb-3"
                >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/30 text-gray-800 shadow text-sm max-w-[70%]">
                        {selectedCampus.name === "Campus" ? (
                            <Image alt="campus" src="/campus.png" height={30} width={30} />
                        ) : (
                            <i className="ri-file-text-line text-lg" />
                        )}
                        <span className="break-words font-semibold">
                            {selectedCampus.description}
                        </span>
                    </div>
                </motion.div>
            )}
            <div
                ref={scrollContainerRef}
                className="flex-1 flex flex-col-reverse space-y-3 space-y-reverse relative overflow-y-auto scroll-smooth"
            >
                <div ref={messagesEndRef} />
                <AnimatePresence>


                    {/* Messages */}
                    {safeMessages.map((msg) => {
                        const isMine = msg.user?.uid === user?.uid;

                        return (
                            <motion.div
                                onDoubleClick={() => handleDoubleClick(msg)}
                                onTouchStart={(e) => handleSwipeStart(e, msg.mid)}
                                onTouchMove={(e) => handleSwipeMove(e, msg.mid)}
                                onTouchEnd={(e) => handleSwipeEnd(e, msg.mid, msg)}
                                key={`${selectedCampus?.cid || "none"}-${msg.mid}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className={`flex relative group ${isMine ? "justify-end" : "justify-start"
                                    } mb-2`}
                                style={{ transform: `translateX(${getSwipeOffset(msg.mid)}px)` }}
                            >


                                <div
                                    id="msg"
                                    className={`relative min-w-[20vh] no-scrollbar max-w-[30vh] lg:max-w-[40vh] max-h-[50vh] rounded-2xl shadow p-3 text-sm flex flex-col gap-2 ${isMine
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-100 text-gray-800"
                                        }`}
                                >

                                    {/* Reply bubble */}
                                    {msg.isReply && (
                                        <div
                                            className={`mb-2 rounded-lg overflow-hidden ${isMine ? "bg-blue-600/20" : "bg-gray-200/80"
                                                }`}
                                        >
                                            <div className="flex items-start gap-2 p-2">
                                                <MessageCircleReply
                                                    size={16}
                                                    className={isMine ? "text-blue-300" : "text-gray-500"}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span
                                                            className={`text-xs font-semibold ${isMine ? "text-blue-200" : "text-gray-700"
                                                                }`}
                                                        >
                                                            {msg.isReply ?
                                                                msg.replyToId == user.uid ? ('You') :
                                                                    (msg.replyToUsername) : ''
                                                            }

                                                        </span>
                                                    </div>
                                                    <p
                                                        className={`text-xs leading-tight ${isMine ? "text-blue-100/90" : "text-gray-600"
                                                            }`}
                                                    >
                                                        {msg.replyToText || "(No message)"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Username + Tag */}
                                    <div className="flex justify-between items-center">
                                        <p
                                            className={`font-semibold text-md ${isMine ? "text-yellow-400" : "text-blue-600"
                                                }`}
                                        >
                                            {isMine ? "" : msg.user?.username || "Unknown"}
                                        </p>
                                        <span
                                            className={`glass border-2 h-7 w-7 group-hover:h-auto group-hover:w-auto flex items-center justify-center gap-1 rounded-full group-hover:px-2 group-hover:py-0.5 text-xs ${TAG_COLORS[msg.tag] || TAG_COLORS.Message
                                                }`}
                                        >
                                            {msg.tag === "Campus" ? (
                                                <Image
                                                    alt="campus"
                                                    src="/campus.png"
                                                    height={20}
                                                    width={20}
                                                />
                                            ) : (
                                                <i
                                                    className={`${TAG_ICONS[msg.tag] || TAG_ICONS.Message
                                                        } text-sm`}
                                                />
                                            )}
                                            <span className="font-semibold hidden group-hover:flex">
                                                {msg.tag || "Message"}
                                            </span>
                                        </span>
                                    </div>

                                    <p className="break-words font-semibold">{msg.text}</p>

                                    {/* Files */}
                                    {msg.files?.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            {msg.files.map((file) => {
                                                const isImage = file.fileType?.startsWith("image/");
                                                return isImage ? (
                                                    <img
                                                        key={file.id}
                                                        src={file.url}
                                                        alt={file.filename}
                                                        onClick={() => window.open(file.url, "_blank")}
                                                        className="rounded-xl min-h-[30vh] min-w-[20vh] w-auto h-auto overflow-hidden lg:w-full cursor-pointer max-h-48 object-cover"
                                                    />
                                                ) : (
                                                    <a
                                                        // 👈 this enforces your own filename
                                                        key={file.id}
                                                        className="flex items-center gap-2 px-3 py-2 w-full rounded-xl bg-black/10 cursor-pointer hover:bg-black/20 transition"
                                                    >
                                                        <i className="ri-file-2-line text-lg" />
                                                        <span className="truncate text-sm">{file.filename}</span>
                                                    </a>

                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Reaction button dynamically positioned */}
                                    <div
                                        className={`absolute ${isMine ? "hidden" : "left-[110%]"}`}

                                    >
                                        <button
                                            onClick={() => handleReaction(msg.mid)}
                                            disabled={meTooState[msg.mid]}
                                            className={`flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 border border-pink-300 shadow transition hover:scale-105 active:scale-95 ${meTooState[msg.mid] ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                        >
                                            <span className="text-pink-500 text-sm font-bold">+1</span>
                                        </button>
                                    </div>
                                </div>

                                <p>{msg.seen ? "Seen" : "Unseen"} | Me Too: {msg.meTooCount}</p>


                            </motion.div>

                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
