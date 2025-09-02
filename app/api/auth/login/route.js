import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/app/db";
import { users } from "@/app/db/schema/campus";
import { eq } from "drizzle-orm";

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // ✅ Fetch user by email
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        if (result.length === 0) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const user = result[0]; // take first (and only) match

        // ✅ check password
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // ✅ Login successful, return user (you can add JWT here later)
        return NextResponse.json({ message: "Login successful", user });
    } catch (err) {
        console.error("Login API error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
