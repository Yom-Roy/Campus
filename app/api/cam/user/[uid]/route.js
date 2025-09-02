import { db } from "@/app/db";
import { campuses, campusMembers } from "@/app/db/schema/campus";
import { eq } from "drizzle-orm";

export async function GET(req, { params }) {
    try {
        const { uid } = await params;

        if (!uid) {
            return new Response(
                JSON.stringify({ error: "User ID is required" }),
                { status: 400 }
            );
        }

        // Fetch campuses the user has joined
        const joinedCampuses = await db
            .select({
                cid: campuses.cid,
                name: campuses.name,
                description: campuses.description,
                type: campuses.type,
                ownerId: campuses.ownerId,
                ownerName: campuses.ownerName,
                ownerRole: campuses.ownerRole,
                createdAt: campuses.createdAt,
                updatedAt: campuses.updatedAt,
            })
            .from(campusMembers)
            .innerJoin(campuses, eq(campusMembers.campusId, campuses.cid))
            .where(eq(campusMembers.userId, parseInt(uid)));

        return new Response(JSON.stringify(joinedCampuses), { status: 200 });
    } catch (err) {
        console.error("Error fetching joined campuses:", err);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500 }
        );
    }
}
