// app/api/tldr/[cid]/route.js
import { db } from "@/app/db";
import { messages, users } from "@/app/db/schema/campus";
import { desc, eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(req, { params }) {
    try {
        const { cid } = await params;
        const campusId = Number(cid);

        if (!campusId) {
            return new Response(JSON.stringify({ error: "Campus ID required" }), { status: 400 });
        }

        // ✅ Fetch last 10 messages + user info
        const lastMessages = await db
            .select({
                text: messages.text,
                createdAt: messages.createdAt,
                username: users.username,
            })
            .from(messages)
            .leftJoin(users, eq(messages.userId, users.uid))
            .where(eq(messages.campusId, campusId))
            .orderBy(desc(messages.createdAt))
            .limit(10);

        if (!lastMessages.length) {
            return new Response(JSON.stringify({ summary: "No recent messages to summarize." }));
        }

        // ✅ Format as conversation
        const textData = lastMessages
            .reverse() // oldest → newest
            .map((m) => `${m.username || "User"}: ${m.text}`)
            .join("\n");

        // ✅ Gemini setup
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are an assistant for summarizing student campus chats.
Summarize the following last 10 messages into a clear, short TL;DR.
Keep only the real discussion points, no filler. only the tldr no need to write any heading or point like 'TL:DR'.

Chat:
${textData}
`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        return new Response(JSON.stringify({ summary }), { status: 200 });
    } catch (err) {
        console.error("[TLDR_ERROR]", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
