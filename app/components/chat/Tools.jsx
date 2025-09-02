import React from "react";
import Filters from "./Filters";
import GlobalCampuses from "./GlobalCampuses";

export default function Tools({ filters, selectedFilter, setSelectedFilter, globalcam, campuses, inputValue, handleJoinCampus }) {
    return (
        <div className="w-1/4 bg-white/30 backdrop-blur-md rounded-2xl p-4 shadow-md flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="ri-tools-line"></i> Tools
            </h2>
            <Filters filters={filters} selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
            <GlobalCampuses globalcam={globalcam} campuses={campuses} inputValue={inputValue} handleJoinCampus={handleJoinCampus} />
        </div>
    );
}
