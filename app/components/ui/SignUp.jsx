"use client"
import { useRouter } from "next/navigation";
import React, { useState } from "react";


const SignUp = () => {
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const router = useRouter();


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();


            if (!res.ok) {
                setError(data.error || "Something went wrong");
            } else {
                setSuccess("Account created successfully!");
                // ✅ Use join logic to add owner as member
                const response = await fetch("/api/cam/join", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ campusId: process.env.MAIN_CAMPUSID, userId: data.user.id, role: "member" })
                });
                await res.json()
                setForm({ username: "", email: "", password: "" });
                // Redirect to login page after 1s
                setTimeout(() => {
                    router.push("/login");
                }, 1000);
            }
        } catch {
            setError("Server error, try again later");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-100 to-purple-200">
            <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-semibold text-center mb-6">Create Your Account</h1>

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                {success && <p className="text-green-500 text-sm mb-3">{success}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-700 mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full cursor-pointer py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                    >
                        {loading ? "Signing Up..." : "Sign Up"}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-500">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 cursor-pointer">Log in</a>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
