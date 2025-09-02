import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";

export default function CreateCampusButton({ onCampusCreated, user }) {
    const [open, setOpen] = useState(false);
    const [newType, setNewType] = useState("Private");
    const [formData, setFormData] = useState({
        name: "",
        type: "private",
        ownerId: user?.uid,
        ownerName: user?.username,
        description: "",
    });

    const popupRef = useRef(null);

    // Update type in lowercase
    useEffect(() => {
        setFormData((prev) => ({ ...prev, type: newType.toLowerCase() }));
    }, [newType]);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const typeOptions = ["Private", "Global"];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/cam/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                onCampusCreated(data.campus);
                setOpen(false);
                // ✅ Use join logic to add owner as member
                const res = await fetch("/api/cam/join", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ campusId: data.campus.cid, userId: data.campus.ownerId, role: "owner" })
                });
                await res.json()
                setFormData({
                    name: "",
                    type: "private",
                    description: "",
                });
                setNewType("Private");
            } else {
                alert(data.error || "Something went wrong");
            }
        } catch (err) {
            console.error("Create Campus error:", err);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1 cursor-pointer p-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 justify-start"
            >
                <Plus size={18} /> Create
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div ref={popupRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            Create New Campus
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Campus Name"
                                className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Description"
                                className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {typeOptions.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpen(false);
                                        setNewType("Private");
                                    }}
                                    className="px-4 py-2 cursor-pointer rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 cursor-pointer py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
