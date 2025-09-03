"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

import MesList from "./MesList";
import MesInput from "./MesInput";
import CampusList from "./CampusList";
import Filter from "./Filter";
import Gcam from "./Gcam";
import Campus from "../ux/Campus";
import { X, LayoutList, Settings, Users } from "lucide-react";
import Image from "next/image";

export default function Dashboard() {
    const router = useRouter();
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [selectedCampus, setSelectedCampus] = useState(null);
    const [campuses, setCampuses] = useState([]);
    const [globalCampuses, setGlobalCampuses] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [search, setSearch] = useState("");
    const [newTag, setNewTag] = useState("Message");
    const [loading, setLoading] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [showScrollButton, setShowScrollButton] = useState(false);

    // Reply-related state
    const [replyingTo, setReplyingTo] = useState(null);

    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const textareaRef = useRef(null);


    const user = useMemo(() => {
        try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
    }, []);

    const filters = ["All", "Note", "Question", "Summary", "Message"];
    const tagColors = {
        Note: "bg-indigo-200 text-indigo-800",
        Question: "bg-amber-200 text-amber-800",
        Summary: "bg-lime-200 text-lime-800",
        Message: "bg-gray-200 text-gray-800",
    };

    // --- Fetch Functions ---
    const fetchCampuses = useCallback(async () => {
        if (!user?.uid) return;
        try {
            const res = await fetch(`/api/cam/user/${user.uid}`);
            const data = await res.json();
            setCampuses(data || []);
        } catch (err) { console.error(err); }
    }, [user]);

    const fetchGlobalCampuses = useCallback(async () => {
        if (!user?.uid) return;
        try {
            const res = await fetch(`/api/cam/all?userId=${user.uid}`);
            const data = await res.json();
            setGlobalCampuses(data || []);
        } catch (err) { console.error(err); }
    }, [user]);

    const fetchMessages = useCallback(async () => {
        if (!selectedCampus?.cid) return;
        try {
            const res = await fetch(`/api/ms/${selectedCampus.cid}`);
            const data = await res.json();
            setMessages(data.messages || []);
            // console.log(data);

        } catch (err) {
            console.error(err);
            setMessages([]);
        }
    }, [selectedCampus]);

    useEffect(() => {
        if (!user) return router.push("/login");
        fetchCampuses();
        fetchGlobalCampuses();
    }, [user, router, fetchCampuses, fetchGlobalCampuses]);

    useEffect(() => {
        if (selectedCampus) {
            setMessages([]);
            fetchMessages();
            // Clear reply state when switching campuses
            setReplyingTo(null);
        }
    }, [selectedCampus, fetchMessages]);

    useEffect(() => {
        if (!selectedCampus) return;
        const i = setInterval(fetchMessages, 5000);
        return () => clearInterval(i);
    }, [selectedCampus, fetchMessages]);

    // --- Reply Handlers ---
    const handleReply = useCallback((message) => {
        setReplyingTo(message);
        // Focus the textarea after setting reply
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }, 100);
    }, []);

    const cancelReply = useCallback(() => {
        setReplyingTo(null);
    }, []);

    // --- Message Handlers ---
    const handleSendMessage = async () => {
        if (!newMessage.trim() && attachedFiles.length === 0) return alert("Type a message or attach a file!");
        if (!selectedCampus) return;

        setLoading(true);
        try {
            // 1️⃣ Upload all files to Cloudinary first
            const uploadedFiles = [];

            for (let file of attachedFiles) {
                // Convert file to base64
                const base64 = await fileToBase64(file);

                // Call Cloudinary upload API
                const res = await fetch("/api/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        file: base64.split(",")[1], // remove data:image/...;base64,
                        fileName: file.name,
                        mimeType: file.type,
                    }),
                });

                const data = await res.json();
                if (res.ok) uploadedFiles.push({ url: data.url, name: file.name, type: file.type });
                else console.error("File upload failed:", data);
            }

            const messagePayload = {
                campusId: selectedCampus.cid,
                userId: user.uid,
                text: newMessage,
                tag: newTag,
                files: uploadedFiles,
                ...(replyingTo && {
                    replyTo: {
                        messageId: replyingTo.mid,
                        userId: replyingTo.userId?.uid,   // only userId, no username
                        text: replyingTo.text,
                        tag: replyingTo.tag
                    }
                })
            };


            const messageRes = await fetch("/api/ms/send", {
                method: "POST",
                body: JSON.stringify(messagePayload),
                headers: { "Content-Type": "application/json" },
            });

            const messageData = await messageRes.json();

            if (messageRes.ok) {
                setMessages(prev => [
                    {
                        ...messageData,
                        userId: { uid: user.uid, username: user.username },
                        ...(replyingTo && {
                            replyTo: {
                                messageId: replyingTo.mid,
                            }
                        })
                    },
                    ...prev
                ]);
                setNewMessage("");
                setAttachedFiles([]);
                setReplyingTo(null);
                scrollToBottom();
            }

            else console.log("Send message failed:", messageData);

        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    // Utility: Convert File to Base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(err);
        });
    }


    const handleJoinCampus = async (cid) => {
        if (!user?.uid) return;
        try {
            const res = await fetch("/api/cam/join", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ campusId: cid, userId: user.uid, role: "member" })
            });
            const data = await res.json();
            if (!res.ok) return console.error(data);
            fetchCampuses();
            setShowRightPanel(false);

        } catch (err) { console.error(err); }
    };

    const handleInput = (e) => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px + '10px`;
        setNewMessage(e.target.value);
    };

    const handleFileChange = e => setAttachedFiles(prev => [...prev, ...Array.from(e.target.files)]);
    const removeFile = idx => setAttachedFiles(prev => prev.filter((_, i) => i !== idx));

    const filteredMessages = useMemo(() =>
        selectedFilter === "All" ? messages : messages.filter(msg => msg.tag === selectedFilter),
        [messages, selectedFilter]
    );

    const [showRightPanel, setShowRightPanel] = useState(false);
    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const [mobileView, setMobileView] = useState("campus");

    const handleCampusClick = (campus) => {
        setMobileView("chat");
        setShowLeftPanel(false);
    };


    // --- Props ---
    const propsForCampuses = { campuses, globalCampuses, inputValue: "", handleJoinCampus, setSearch, handleCampusClick, search, selectedCampus, setSelectedCampus, user, fetchCampuses };
    const propsForMessages = {
        messages: filteredMessages,
        user,
        selectedCampus,
        tagColors,
        scrollContainerRef,
        onReply: handleReply,
        messagesEndRef
    };
    const propsForInput = {
        newMessage,
        user,
        selectedCampus,
        setNewMessage,
        handleSendMessage,
        loading,
        textareaRef,
        handleInput,
        newTag,
        setNewTag,
        filters,
        handleFileChange,
        attachedFiles,
        removeFile,
        replyingTo,
        onCancelReply: cancelReply
    };
    const propsForFilters = { filters, selectedFilter, setSelectedFilter };


    // Add this useEffect to the Dashboard component to detect if the user is on mobile
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
    }, []);




    // Add this state to the Dashboard component
    const [isMobile, setIsMobile] = useState(false);

    // Add this to the Dashboard JSX to show a hint about double-click functionality
    {
        !isMobile && (
            <div className="hidden md:flex items-center justify-center text-xs text-gray-500 mt-2">
                <i className="ri-information-line mr-1" />
                Double-click on any message to reply
            </div>
        )
    }

    return (
        <div className="h-screen w-full flex flex-col bg-gradient-to-br from-blue-200 via-blue-100 to-purple-200 overflow-hidden">
            {/* Top Navbar */}
            <div className="w-full flex items-center justify-between p-2 md:hidden">
                <div className="flex gap-6">
                    <Image src={'/campus.png'} height={40} width={40} alt="campus" />
                    {mobileView === "chat" && (
                        <button
                            onClick={() => {
                                setMobileView("campus");
                                setShowLeftPanel(true);
                            }}
                            className="p-2 rounded-md bg-gray-100/20 hover:bg-gray-200/30"
                        >
                            <div className="flex gap-2 items-center">
                                <span>{selectedCampus.name}</span>
                                <X size={20} />
                            </div>
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowLeftPanel(!showLeftPanel)}
                        className="p-2 rounded-md bg-gray-100/20 hover:bg-gray-200/30"
                    >
                        <LayoutList size={20} />
                    </button>
                    <button
                        onClick={() => setShowRightPanel(!showRightPanel)}
                        className="p-2 rounded-md bg-gray-100/20 hover:bg-gray-200/30"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative flex flex-col md:flex-row gap-2 md:gap-4 overflow-hidden">
                {/* Left Panel: Campus List */}
                <div
                    className={`md:w-[250px] relative md:h-full md:flex flex-col rounded-2xl p-4
        ${showLeftPanel ? "fixed top-0 left-0 z-30 h-full w-full md:relative md:flex" : "hidden md:flex"}
        ${!showLeftPanel ? "bg-transparent md:bg-white/30" : "bg-white/30 backdrop-blur-md shadow-md"}`}
                >
                    <div className="md:hidden flex justify-between mb-2">
                        <div className="h-auto flex items-center justify-center rounded-4xl px-4 text-white w-auto bg-blue-400">
                            <span>{user?.username || 'Unknown'}</span>
                        </div>
                        <button
                            onClick={() => setShowLeftPanel(false)}
                            className="p-2 rounded-md flex items-center ju h-8 w-8 mb-2 bg-gray-400/20 hover:bg-gray-200/30"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 relative overflow-y-auto">
                        <CampusList {...propsForCampuses} />
                    </div>
                </div>

                {/* Center Panel: Chat */}
                <div
                    className={`flex-1 rounded-2xl p-3 md:p-4 bg-white/40 md:bg-white/40 backdrop-blur-md shadow-md flex flex-col h-full
    ${(mobileView === "campus" && !selectedCampus) ? "hidden md:flex" : "flex"}`}
                >
                    {selectedCampus ? (
                        <>
                            {/* Chat Header */}
                            <div className="mb-2 hidden lg:flex md:mb-4 p-2 bg-white/20 rounded-lg shrink-0 justify-between items-center">
                                <h2 className="font-semibold text-gray-700 text-sm md:text-base">
                                    {selectedCampus.name || `Campus ${selectedCampus.cid}`}
                                </h2>
                                <p className="text-xs md:text-sm text-gray-600">{messages.length} messages</p>
                            </div>

                            {/* Messages */}
                            <div
                                id="msg"
                                className="flex-1 overflow-y-auto flex"
                                style={{ maxHeight: mobileView === "campus" ? "70vh" : "auto" }}
                            >
                                <MesList {...propsForMessages} />
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="mt-2 shrink-0">
                                <MesInput {...propsForInput} />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <Campus />
                            <p className="text-center mt-2 text-sm">Select a campus to start messaging.</p>
                        </div>
                    )}

                </div>

                {/* Right Panel: Filters + Global Campuses */}
                <div
                    className={`md:w-[300px] md:h-full rounded-2xl p-4 md:flex flex-col
        ${showRightPanel ? "fixed top-0 right-0 z-30 h-full w-full md:relative md:flex" : "hidden md:flex"}
        ${!showRightPanel ? "bg-transparent md:bg-white/40" : "bg-white/40 backdrop-blur-md shadow-md"}`}
                >
                    <div className="md:hidden flex justify-end mb-2">
                        <button
                            onClick={() => setShowRightPanel(false)}
                            className="p-2 rounded-md bg-gray-100/20 hover:bg-gray-200/30"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <Filter {...propsForFilters} />
                </div>
            </div>
        </div>
    );
}