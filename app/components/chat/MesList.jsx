"use client"
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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


export default function MesList({ messages = [], user, selectedCampus, scrollContainerRef }) {


    return (
        <div ref={scrollContainerRef} className="flex-1 space-y-3 relative scroll-smooth">
            <AnimatePresence>
                {/* Campus Description Bubble */}
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
                            {
                                selectedCampus.name == "Campus" ? (
                                    <Image alt="campus" src="/campus.png" height={30} width={30} />
                                ) : (
                                    <i className="ri-file-text-line text-lg" />
                                )
                            }
                            <span className="break-words font-semibold">{selectedCampus.description}</span>
                        </div>
                    </motion.div>
                )}

                {/* User Messages */}
                {messages.map((msg) => {
                    const isMine = msg.userId?.uid === user?.uid;
                    return (
                        <motion.div
                            key={`${selectedCampus?.cid || "none"}-${msg.mid}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}
                        >
                            <div
                                id="msg"
                                className={`min-w-[20vh] group no-scrollbar max-w-[30vh] lg:max-w-[40vh] max-h-[50vh] overflow-y-auto overflow-x-hidden rounded-2xl relative shadow p-3 text-sm flex flex-col gap-2 ${isMine ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {/* Username + Tag */}
                                <div className="flex gap-2 justify-between items-center w-full h-auto">
                                    <p
                                        className={`font-semibold text-md ${isMine ? "text-yellow-400" : "text-blue-600"
                                            }`}
                                    >
                                        {isMine ? "You" : msg.userId?.username || "Unknown"}
                                    </p>
                                    <span
                                        className={`glass border-2 h-7 w-7 group-hover:h-auto group-hover:w-auto flex items-center justify-center gap-1 rounded-full group-hover:px-2 group-hover:py-0.5 text-xs ${TAG_COLORS[msg.tag] || TAG_COLORS.Message
                                            }`}
                                    >
                                        {msg.tag == 'Campus' ? (<Image alt="campus" src="/campus.png" height={20} width={20} />)
                                            : (
                                                <i className={`${TAG_ICONS[msg.tag] || TAG_ICONS.Message} text-sm`} />
                                            )
                                        }
                                        <span className="font-semibold hidden group-hover:flex">{msg.tag || "Message"}</span>
                                    </span>
                                </div>

                                {/* Files */}
                                {msg.files?.length > 0 && (
                                    <div className="flex flex-col gap-2 mt-2">
                                        {msg.files.map((file, idx) => {
                                            const isImage = file.fileType?.startsWith("image/");
                                            return isImage ? (
                                                <img
                                                    key={idx}
                                                    src={file.url}
                                                    alt={file.filename}
                                                    onClick={() => window.open(file.url, "_blank")}
                                                    className="rounded-xl w-full cursor-pointer max-h-48 object-cover"
                                                />
                                            ) :
                                                (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-2 px-3 py-2 w-full rounded-xl bg-black/10 cursor-pointer hover:bg-black/20 transition"
                                                        onClick={() => window.open(file.url, "_blank")}
                                                    >
                                                        <i className="ri-file-2-line text-lg" />
                                                        <span className="truncate text-sm">{file.filename.split(" ").slice(0, 10).join(" ")}</span>
                                                    </div>
                                                );
                                        })}
                                    </div>
                                )}

                                {/* Text */}
                                <p className="break-words">{msg.text}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

