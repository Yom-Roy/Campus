import { db } from "@/app/db";
import { messages, files, users } from "@/app/db/schema/campus";
import { eq } from "drizzle-orm";

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
            return new Response(
                JSON.stringify({ error: "Missing campusId or userId" }),
                { status: 400 }
            );
        }

        // 🟢 If replying, fetch original message & user
        let replyData = null;
        if (replyTo?.messageId) {
            const [originalMsg] = await db
                .select({
                    mid: messages.mid,
                    text: messages.text,
                    uid: messages.userId,
                    username: users.username,
                })
                .from(messages)
                .leftJoin(users, eq(messages.userId, users.uid))
                .where(eq(messages.mid, replyTo.messageId));

            if (originalMsg) {
                replyData = {
                    id: originalMsg.mid,
                    userId: originalMsg.uid,
                    username: originalMsg.username,
                    text: originalMsg.text,
                };
            }
        }

        // 1️⃣ Insert new message
        const [msg] = await db
            .insert(messages)
            .values({
                campusId,
                userId,
                text,
                tag,
                isReply: !!replyData,
                replyToId: replyData?.id || null,
                replyToUserId: replyData?.userId || null,
                replyToUsername: replyData?.username || null,
                replyToText: replyData?.text || null,
            })
            .returning();

        // 2️⃣ Insert files
        for (const file of uploadedFiles) {
            await db.insert(files).values({
                messageId: msg.mid,
                filename: file.name,
                url: file.url,
                fileType: file.type || file.name.split(".").pop(),
            });
        }

        return new Response(
            JSON.stringify({
                ...msg,
                files: uploadedFiles,
                ...(replyData && { replyTo: replyData }),
            }),
            { status: 200 }
        );
    } catch (err) {
        console.error("[SEND_MESSAGE_ERROR]", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
        });
    }
}
