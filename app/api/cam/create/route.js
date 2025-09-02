import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { campuses } from "@/app/db/schema/campus";
import { eq } from "drizzle-orm";


export async function POST(req) {
    try {
        const body = await req.json();
        const { name, type, ownerId, ownerName, description } = body;

        if (!name || !type || !ownerId || !ownerName) {
            return NextResponse.json(
                { error: "All required fields must be filled" },
                { status: 400 }
            );
        }

        // ✅ Check if campus with same name exists
        const existing = await db
            .select()
            .from(campuses)
            .where(eq(campuses.name, name));

        if (existing.length > 0) {
            return NextResponse.json(
                { error: "Campus with this name already exists" },
                { status: 400 }
            );
        }

        // ✅ Insert new campus
        const [newCampus] = await db
            .insert(campuses)
            .values({
                name,
                type,
                ownerId,
                ownerName,
                description: description || null,
            })
            .returning(); // returns ALL columns, including the PK


        return NextResponse.json({
            message: "Campus created successfully",
            campus: newCampus,
        });
    } catch (err) {
        console.error("Create Campus API error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
