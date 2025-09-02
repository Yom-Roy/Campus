import { db } from "@/app/db";
import { messages, files } from "@/app/db/schema/campus";

export async function POST(req) {
    try {
        const body = await req.json();
        const campusId = Number(body.campusId);
        const userId = Number(body.userId);
        const text = body.text?.trim() || "";
        const tag = body.tag || "Message";
        const uploadedFiles = Array.isArray(body.files) ? body.files : [];
        const replyTo = body.replyTo;

        if (!campusId || !userId) {
            return new Response(JSON.stringify({ error: "Missing campusId or userId" }), { status: 400 });
        }

        // 1️⃣ Insert message
        const [msg] = await db.insert(messages).values({
            campusId,
            userId,
            text,
            tag,
            isReply: replyTo ? true : false,
            replyToId: replyTo?.messageId,
            replyToUserId: replyTo?.userId,
            replyToUsername: replyTo?.username,
            replyToText: replyTo?.text,
        }).returning();

        // 2️⃣ Insert files
        for (const file of uploadedFiles) {
            await db.insert(files).values({
                messageId: msg.mid,
                filename: file.name,
                url: file.url,
                fileType: file.type || file.name.split(".").pop(),
            });
        }

        return new Response(JSON.stringify({ ...msg, files: uploadedFiles }), { status: 200 });
    } catch (err) {
        console.error("[SEND_MESSAGE_ERROR]", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
