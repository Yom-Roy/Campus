import React from "react";

export default function Gcam({
    globalCampuses = [],
    joinedCampuses = [],
    inputValue = "",
    handleJoinCampus,
}) {
    // Filter campuses based on search and already joined
    const filteredCampuses = globalCampuses.filter((campus) => {
        const matchesSearch = campus.name.toLowerCase().includes(inputValue.toLowerCase());
        const alreadyJoined = joinedCampuses.some((joined) => joined.cid === campus.cid);
        return matchesSearch && !alreadyJoined;
    });

    return (
        <div className="">
            <h3 className="font-medium mb-3 flex items-center gap-2 text-gray-700 text-lg">
                <i className="ri-global-line" /> Global Campuses
            </h3>

            {filteredCampuses.length === 0 ? (
                <p className="text-gray-400">No global campus found.</p>
            ) : (
                <div className="space-y-3">
                    {filteredCampuses.map((campus) => (
                        <div
                            key={campus.cid}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/70 hover:bg-blue-50 shadow-sm transition cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <i className="ri-building-2-line text-blue-600 text-lg" />
                                <span className="font-medium text-gray-800">{campus.name}</span>
                            </div>
                            <button
                                onClick={() => handleJoinCampus(campus.cid)}
                                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 active:scale-95 transition"
                            >
                                Join
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
