"use client";
import React from "react";
import CreateCampusButton from "../ux/CreateCampusButton";
import Image from "next/image";

export default function CampusList({
    campuses = [],
    search,
    setSearch,
    selectedCampus,
    setSelectedCampus,
    user,
    fetchCampuses,
    handleCampusClick
}) {
    return (
        <div className="flex flex-col h-full w-full">
            {/* Header + Create button */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-1">
                    <i className="ri-user-community-fill" /> My Campuses
                </h2>
                <CreateCampusButton user={user} onCampusCreated={fetchCampuses} />
            </div>

            {/* Search input */}
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campus..."
                className="w-full p-2 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* List of joined campuses */}
            <ul className="flex-1 overflow-y-auto space-y-2">
                {campuses
                    .filter((campus) =>
                        campus.name.toLowerCase().includes(search?.toLowerCase() || "")
                    )
                    .map((campus) => (
                        <li
                            key={campus.cid}
                            className={`p-2 rounded-xl cursor-pointer flex items-center gap-2 transition ${selectedCampus?.cid === campus.cid
                                ? "bg-blue-200"
                                : "bg-white/60 hover:bg-white/80"
                                }`}
                            onClick={() => {
                                setSelectedCampus(campus);
                                handleCampusClick();
                            }}
                        >
                            {campus.name == "Campus" ? (
                                <Image alt='campus' height={30} width={30} src='/campus.png' />
                            )
                                : (<i className="ri-group-line" />)
                            }
                            <span className="truncate">
                                {campus.name}{" "}
                                {campus.type === "global" && (
                                    <i className="ri-earth-line text-sm text-gray-500" />
                                )}
                            </span>
                        </li>
                    ))}

                {campuses.length === 0 && (
                    <li className="text-gray-400 text-sm text-center mt-4">
                        You haven’t joined any campus yet.
                    </li>
                )}
            </ul>
        </div>
    );
}
