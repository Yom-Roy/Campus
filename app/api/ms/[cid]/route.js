import { db } from "@/app/db";
import { messages, files, users } from "@/app/db/schema/campus";
import { eq, desc, inArray } from "drizzle-orm";

export async function GET(req, { params }) {
    try {
        const { cid } = await params;
        const campusId = Number(cid);

        if (!campusId) {
            return new Response(JSON.stringify({ error: "campusId required", messages: [] }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // ✅ Fetch messages + user info
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
                user: {
                    uid: users.uid,
                    username: users.username,
                },
            })
            .from(messages)
            .leftJoin(users, eq(messages.userId, users.uid))
            .where(eq(messages.campusId, campusId))
            .orderBy(desc(messages.createdAt));

        // ✅ Fetch files only for returned mids
        const mids = data.map((m) => m.mid);
        let filesData = [];
        if (mids.length > 0) {
            filesData = await db.select().from(files).where(inArray(files.messageId, mids));
        }

        // ✅ Attach files
        const withFiles = data.map((msg) => ({
            ...msg,
            files: filesData.filter((f) => f.messageId === msg.mid),
        }));

        return new Response(JSON.stringify({ messages: withFiles }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("[FETCH_MESSAGES_ERROR]", err);
        return new Response(JSON.stringify({ error: err.message, messages: [] }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();

        const {
            campusId,
            userId,
            text,
            tag = "Message",
            replyToId,
            replyToUserId,
            replyToUsername,
            replyToText,
            files: fileArray = [],
        } = body;

        const inserted = await db
            .insert(messages)
            .values({
                campusId,
                userId,
                text,
                tag,
                isReply: !!replyToId,
                replyToId,
                replyToUserId,
                replyToUsername,
                replyToText,
            })
            .returning();

        const messageId = inserted[0].mid;

        if (fileArray.length > 0) {
            await db.insert(files).values(
                fileArray.map((f) => ({
                    messageId,
                    filename: f.filename,
                    url: f.url,
                    fileType: f.fileType,
                }))
            );
        }

        return new Response(JSON.stringify({ success: true, message: inserted[0] }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("[POST_MESSAGE_ERROR]", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
