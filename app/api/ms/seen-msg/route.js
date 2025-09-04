import { db } from "@/app/db";
import { messageSeen } from "@/app/db/schema/campus";
import { eq } from "drizzle-orm";

export async function POST(req) {
    try {
        const { mid, userId } = await req.json();
        if (!mid || !userId) return new Response(JSON.stringify({ error: "mid and userId required" }), { status: 400 });

        const alreadySeen = await db.select().from(messageSeen)
            .where(eq(messageSeen.messageId, mid))
            .where(eq(messageSeen.userId, userId));

        if (alreadySeen.length > 0) {
            return new Response(JSON.stringify({ message: "Already seen" }), { status: 200 });
        }

        await db.insert(messageSeen).values({ messageId: mid, userId });

        return new Response(JSON.stringify({ message: "Marked as seen" }), { status: 200 });
    } catch (err) {
        console.error("[SEEN_MESSAGE_ERROR]", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
