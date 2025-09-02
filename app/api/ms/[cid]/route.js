import { db } from "@/app/db";
import { messages, users, files } from "@/app/db/schema/campus";
import { eq, inArray } from "drizzle-orm";

export async function GET(req, { params }) {
    try {
        const { cid } = await params;

        // First, get messages with user info
        const messagesData = await db
            .select({
                mid: messages.mid,
                text: messages.text,
                tag: messages.tag,
                createdAt: messages.createdAt,
                userId: messages.userId,
                userUid: users.uid,
                username: users.username,
            })
            .from(messages)
            .innerJoin(users, eq(messages.userId, users.uid))
            .where(eq(messages.campusId, parseInt(cid)))
            .orderBy(messages.createdAt);

        // Get files for all messages at once
        const messageIds = messagesData.map(msg => msg.mid);

        let filesData = [];
        if (messageIds.length > 0) {
            filesData = await db
                .select()
                .from(files)
                .where(inArray(files.messageId, messageIds));
        }

        // Group files by messageId
        const filesByMessage = {};
        filesData.forEach(file => {
            if (!filesByMessage[file.messageId]) {
                filesByMessage[file.messageId] = [];
            }
            filesByMessage[file.messageId].push(file);
        });

        // Format the response to match your frontend expectations
        const formattedMessages = messagesData.map(msg => ({
            mid: msg.mid,
            text: msg.text,
            tag: msg.tag,
            createdAt: msg.createdAt,
            userId: {
                uid: msg.userUid,
                username: msg.username,
            },
            files: filesByMessage[msg.mid] || [],
        }));

        return Response.json(formattedMessages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}