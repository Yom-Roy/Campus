import { db } from "@/app/db";
import { campuses, campusMembers } from "@/app/db/schema/campus";
import { notInArray, eq, and } from "drizzle-orm";

export async function GET(req) {
    try {
        // Get userId from query parameters
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return Response.json({ error: "userId is required" }, { status: 400 });
        }

        // Get all campus IDs where the user is already a member
        const userCampuses = await db
            .select({ campusId: campusMembers.campusId })
            .from(campusMembers)
            .where(eq(campusMembers.userId, parseInt(userId)));

        const userCampusIds = userCampuses.map(uc => uc.campusId);

        // Get all campuses where:
        // 1. Type is 'global' (assuming you have a type field)
        // 2. User is not a member
        let query = db
            .select({
                cid: campuses.cid,
                name: campuses.name,
                description: campuses.description,
                type: campuses.type,
                ownerName: campuses.ownerName,
                createdAt: campuses.createdAt,
            })
            .from(campuses)
            .where(eq(campuses.type, 'global'));

        // If user has joined campuses, exclude them
        if (userCampusIds.length > 0) {
            query = query.where(
                and(
                    eq(campuses.type, 'global'),
                    notInArray(campuses.cid, userCampusIds)
                )
            );
        }

        const data = await query;
        return Response.json(data);
    } catch (err) {
        console.error("Error fetching global campuses:", err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}