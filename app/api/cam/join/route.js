import { db } from "@/app/db";
import { campusMembers } from "@/app/db/schema/campus";

export async function POST(req) {
    try {
        const { campusId, userId, role } = await req.json();

        await db.insert(campusMembers).values({
            campusId: Number(campusId),
            userId: Number(userId),
            role: role || "member",
        });

        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
