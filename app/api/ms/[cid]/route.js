import { db } from "@/app/db";
import { messages, files, users, messageSeen } from "@/app/db/schema/campus";
import { eq, desc, inArray } from "drizzle-orm";

export async function GET(req, { params }) {
    try {
        const { cid, userId } = await params; // userId optional
        const campusId = Number(cid);
        const safeUserId = userId ? Number(userId) : null;

        if (!campusId || isNaN(campusId)) {
            return new Response(
                JSON.stringify({ error: "campusId required", messages: [] }),
                { status: 400 }
            );
        }

        // Fetch messages + user info
        const data = await db
            .select({
                mid: messages.mid,
                campusId: messages.campusId,
                text: messages.text,
                tag: messages.tag,
                createdAt: messages.createdAt,
                isReply: messages.isReply,
                replyToId: messages.replyToId,
                replyToText: messages.replyToText,
                replyToUsername: messages.replyToUsername,
                meTooCount: messages.meTooCount,
                user: { uid: users.uid, username: users.username },
            })
            .from(messages)
            .leftJoin(users, eq(messages.userId, users.uid))
            .where(eq(messages.campusId, campusId))
            .orderBy(desc(messages.createdAt));

        const mids = data.map((m) => m.mid);

        // Fetch files
        const filesData =
            mids.length > 0
                ? await db.select().from(files).where(inArray(files.messageId, mids))
                : [];

        // Fetch seen by this user (safe)
        let seenData = [];
        if (mids.length > 0 && safeUserId) {
            seenData = await db
                .select()
                .from(messageSeen)
                .where(inArray(messageSeen.messageId, mids))
                .where(eq(messageSeen.userId, safeUserId));
        }
        const seenIds = seenData.map((s) => s.messageId);

        // Attach files + seen info
        const withExtras = data.map((msg) => ({
            ...msg,
            files: filesData.filter((f) => f.messageId === msg.mid),
            seen: seenIds.includes(msg.mid),
        }));

        return new Response(
            JSON.stringify({ messages: withExtras }),
            { status: 200 }
        );
    } catch (err) {
        console.error("[FETCH_MESSAGES_ERROR]", err);
        return new Response(
            JSON.stringify({ error: err.message, messages: [] }),
            { status: 500 }
        );
    }
}
