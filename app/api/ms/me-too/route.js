import { db } from "@/app/db";
import { messages, meToo } from "@/app/db/schema/campus";
import { eq, sql } from "drizzle-orm";

export async function POST(req) {
    try {
        const { mid, userId } = await req.json();
        if (!mid || !userId) {
            return new Response(JSON.stringify({ error: "mid and userId required" }), { status: 400 });
        }

        // Check if already tagged
        const already = await db.select().from(meToo)
            .where(eq(meToo.messageId, mid))
            .where(eq(meToo.userId, userId));

        if (already.length > 0) {
            return new Response(JSON.stringify({ error: "Already tagged 'Me Too'" }), { status: 400 });
        }

        // Insert new Me Too
        await db.insert(meToo).values({ messageId: mid, userId });

        // Increment counter safely
        await db.update(messages)
            .set({ meTooCount: sql`${messages.meTooCount} + 1` }) // ✅ use imported sql
            .where(eq(messages.mid, mid));

        const [updated] = await db.select().from(messages).where(eq(messages.mid, mid));

        return new Response(JSON.stringify({ meTooCount: updated.meTooCount }), { status: 200 });
    } catch (err) {
        console.error("[ME_TOO_ERROR]", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
