"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "remixicon/fonts/remixicon.css";

const TAGS = [
    { name: "Note", color: "indigo", icon: "ri-book-2-line", iconColor: "text-indigo-500" },
    { name: "Message", color: "emerald", icon: "ri-chat-3-line", iconColor: "text-emerald-500" },
    { name: "Question", color: "amber", icon: "ri-question-line", iconColor: "text-amber-500" },
    { name: "Summary", color: "rose", icon: "ri-file-list-line", iconColor: "text-rose-500" },
];

export default function TagInput({
    newMessage,
    setNewMessage,
    handleSendMessage,
    loading,
    textareaRef,
    newTag,
    setNewTag,
    selectedCampus,
    handleFileChange,
    attachedFiles,
    removeFile,
    user
}) {
    const [showTags, setShowTags] = useState(false);
    // Add a ref to the tag
    const tagRef = useRef(null);
    const [tagWidth, setTagWidth] = useState(0);

    // Update tag width dynamically whenever tag changes
    useEffect(() => {
        if (tagRef.current) {
            setTagWidth(tagRef.current.offsetWidth);
        } else {
            setTagWidth(0);
        }
    }, [newTag, newMessage]);


    const handleSelectTag = (tag) => {
        setNewTag(newTag === tag ? null : tag);
        setShowTags(false);
    };


    return (
        <>
            {/* File preview */}
            {attachedFiles?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 md:gap-3">
                    {attachedFiles.map((file, idx) => (
                        <div
                            key={idx}
                            className={`flex overflow-hidden flex-col items-center justify-center gap-1 px-2 py-1 rounded-xl shadow-md text-sm text-gray-800 w-20 h-20 relative md:w-24 md:h-24`}
                        >
                            {file.type.startsWith("image/") ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="h-16 w-16 md:h-24 md:w-24 object-cover rounded-lg shadow-sm"
                                />
                            ) : file.type === "application/pdf" ? (
                                <>
                                    <i className="ri-file-pdf-2-line text-orange-600 text-3xl" />
                                    <span className="text-gray-400 text-xs md:text-sm font-semibold truncate">
                                        PDF
                                    </span>
                                </>
                            ) : file.type === "application/ppt" ? (
                                <>
                                    <i className="ri-file-ppt-2-line text-orange-600 text-3xl" />
                                    <span className="text-gray-400 text-xs md:text-sm font-semibold truncate">
                                        PPT
                                    </span>
                                </>
                            ) : (
                                <i className="ri-file-text-fill text-gray-600 text-3xl" />
                            )}

                            <span
                                className={`truncate text-xs md:text-sm font-medium ${file.type.startsWith("image/") ? "hidden" : "block"
                                    }`}
                            >
                                {file.name.split(" ").slice(0, 4).join(" ")}
                            </span>

                            <button
                                onClick={() => removeFile(idx)}
                                className="absolute top-0 right-0 h-5 w-5 md:h-6 md:w-6 flex items-center justify-center rounded-full bg-white/70 cursor-pointer text-black hover:text-red-500 transition"
                            >
                                <i className="ri-close-line text-sm md:text-lg" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className={`relative w-full mt-2 ${selectedCampus?.name === "Campus" && selectedCampus?.ownerId !== user.uid
                && 'hidden'
                }`
            }
            >
                {/* Tag popup */}
                <AnimatePresence>
                    {showTags && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                            className="absolute bottom-full mb-2 left-0 right-0 flex flex-wrap gap-2 p-2 md:p-3 rounded-xl bg-white backdrop-blur-md border border-gray-200 shadow-xl z-10 text-xs md:text-sm"
                        >
                            {TAGS.map((tag) => (
                                <button
                                    key={tag.name}
                                    onClick={() => handleSelectTag(tag.name)}
                                    className={`flex items-center gap-1 md:gap-2 px-2 py-1 rounded-full border transition
              ${newTag === tag.name
                                            ? `border-${tag.color}-500 text-${tag.color}-600`
                                            : "bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100"
                                        } ${tag.name === "Message" ? "hidden" : "flex"}`}
                                >
                                    <i className={`${tag.icon} ${tag.iconColor} text-sm md:text-base`} />
                                    <span className="font-semibold">{tag.name}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input container */}
                <div className="flex items-end gap-2 w-full flex-wrap md:flex-nowrap">
                    {/* Left controls (plus + attach) */}
                    <div className="flex items-center gap-1 md:gap-2">
                        <button
                            onClick={() => setShowTags((prev) => !prev)}
                            className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-100 transition"
                        >
                            <i className={`ri-${showTags ? "close" : "add"}-line text-gray-700 text-lg`} />
                        </button>

                        <label className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 cursor-pointer rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-100 transition">
                            <i className="ri-attachment-2 text-gray-700 text-lg" />
                            <input type="file" className="hidden" onChange={handleFileChange} multiple />
                        </label>
                    </div>

                    {/* Middle input box */}
                    <div
                        className={`flex flex-col flex-1 px-2 md:px-3 py-1 rounded-t-2xl rounded-br-2xl rounded-bl transition border relative shadow-md ${newTag ? `border-${TAGS.find((t) => t.name === newTag)?.color}-500 bg-white backdrop-blur-md` : "border-gray-300 bg-white backdrop-blur-md"
                            }`}
                    >
                        {/* Tag pill */}
                        {newTag && (
                            <div
                                ref={tagRef}
                                className={`absolute transition-all duration-200 ${newMessage.split("\n").length > 1 || newMessage.length > 40
                                    ? "-top-4 left-2 md:left-3 scale-90"
                                    : "inset-y-0 left-2 md:left-3 flex items-center"
                                    }`}
                            >
                                <div className={`flex items-center px-1 md:px-2 py-0.5 rounded-full text-xs md:text-sm font-medium border border-${TAGS.find((t) => t.name === newTag)?.color}-500 bg-white`}>
                                    <i className={`${TAGS.find((t) => t.name === newTag)?.icon} ${TAGS.find((t) => t.name === newTag)?.iconColor} text-xs md:text-sm`} />
                                    <span className="ml-1 text-gray-800">{newTag}</span>
                                    {newTag !== "Message" && (
                                        <button
                                            onClick={() => setNewTag("Message")}
                                            className="cursor-pointer ml-1 text-gray-500 hover:text-red-500"
                                        >
                                            <i className="ri-close-line text-[12px] md:text-[14px]" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Textarea */}
                        <div
                            className="flex items-end gap-1 md:gap-2"
                            style={{
                                marginLeft:
                                    newTag && !(newMessage.split("\n").length > 1 || newMessage.length > 40)
                                        ? tagWidth + 4
                                        : 0,
                            }}
                        >
                            <textarea
                                ref={textareaRef}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onInput={(e) => {
                                    const textarea = e.target;
                                    textarea.style.height = "auto"; // reset height
                                    textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`; // grow until max 100px
                                }}
                                placeholder="Message anything "
                                rows={1}
                                className="flex-1 max-h-[100px] bg-transparent outline-none text-gray-800 placeholder:text-gray-400 resize-none overflow-y-auto p-1 text-xs md:text-sm"
                                disabled={loading}
                            />

                            {/* Emoji */}
                            <button className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full hover:bg-gray-100 transition">
                                <i className="ri-emotion-line text-gray-600 text-lg" />
                            </button>
                        </div>
                    </div>

                    {/* Send button */}
                    <button
                        onClick={handleSendMessage}
                        disabled={loading}
                        className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <i className="ri-arrow-up-line text-white text-lg" />
                    </button>
                </div>
            </div>
        </>

    );
}
