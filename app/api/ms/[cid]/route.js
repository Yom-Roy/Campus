// app/api/campus/[cid]/route.js
import { db } from "@/app/db";
import { messages, users, files } from "@/app/db/schema/campus";
import { eq } from "drizzle-orm";

export async function GET(req, { params }) {
    try {
        const { cid } = await params;
        const campusId = parseInt(cid, 10);

        if (!campusId || isNaN(campusId)) {
            return new Response(
                JSON.stringify({ error: "Invalid campus ID", messages: [] }),
                { status: 400 }
            );
        }

        // Fetch raw messages + joined user + files
        const rows = await db
            .select({
                mid: messages.mid,
                campusId: messages.campusId,
                text: messages.text,
                tag: messages.tag,
                createdAt: messages.createdAt,
                isReply: messages.isReply,
                replyToId: messages.replyToId,
                replyToUserId: messages.replyToUserId,
                replyToUsername: messages.replyToUsername,
                replyToText: messages.replyToText,
                user_uid: users.uid,
                user_username: users.username,
                user_email: users.email,
                file_id: files.id,
                file_filename: files.filename,
                file_url: files.url,
                file_type: files.fileType,
            })
            .from(messages)
            .leftJoin(users, eq(messages.userId, users.uid))
            .leftJoin(files, eq(messages.mid, files.messageId))
            .where(eq(messages.campusId, campusId))
            .orderBy(messages.createdAt);

        // Group files under messages
        const map = new Map();
        for (const row of rows) {
            if (!map.has(row.mid)) {
                map.set(row.mid, {
                    mid: row.mid,
                    campusId: row.campusId,
                    text: row.text,
                    tag: row.tag,
                    createdAt: row.createdAt,
                    isReply: row.isReply,
                    replyTo: row.isReply
                        ? {
                            mid: row.replyToId,
                            text: row.replyToText,
                            user: {
                                uid: row.replyToUserId,
                                username: row.replyToUsername,
                            },
                        }
                        : null,
                    user: {
                        uid: row.user_uid,
                        username: row.user_username,
                        email: row.user_email,
                    },
                    files: [],
                });
            }

            if (row.file_id) {
                map.get(row.mid).files.push({
                    id: row.file_id,
                    filename: row.file_filename,
                    url: row.file_url,
                    fileType: row.file_type,
                });
            }
        }

        const messagesData = Array.from(map.values());

        return new Response(JSON.stringify({ messages: messagesData }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("[FETCH_MESSAGES_ERROR]", err);
        return new Response(
            JSON.stringify({ error: err.message, messages: [] }),
            { status: 500 }
        );
    }
}
