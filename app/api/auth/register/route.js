import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/app/db";
import { users } from "@/app/db/schema/campus";
import { eq } from "drizzle-orm";

export async function POST(req) {
    try {
        const body = await req.json();
        const { username, email, password } = body;

        if (!username || !email || !password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // ✅ Check if user exists using eq() from drizzle-orm
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email));  // <--- use eq(column, value)

        if (existingUser.length) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db
            .insert(users)
            .values({
                username,
                email,
                password: hashedPassword,
            })
            .returning();

        return NextResponse.json({ message: "User registered", user: newUser[0] });
    } catch (err) {
        console.error("Register API error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
