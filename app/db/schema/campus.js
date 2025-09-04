// server/db/schema.js
import { boolean } from "drizzle-orm/gel-core";
import {
    pgTable,
    serial,
    integer,
    text,
    varchar,
    timestamp,
    primaryKey,
} from "drizzle-orm/pg-core";

// ✅ Users table (since you reference User in your schemas)
export const users = pgTable("users", {
    uid: serial("uid").primaryKey(),
    username: varchar("username", { length: 100 }).notNull(),
    email: varchar("email", { length: 200 }).notNull().unique(),
    password: varchar("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ✅ Campuses
export const campuses = pgTable("campuses", {
    cid: serial("cid").primaryKey(),
    name: varchar("name", { length: 150 }).notNull().unique(),
    description: text("description"),
    type: varchar("type", { length: 50 }).notNull(),

    // owner reference
    ownerId: integer("owner_id")
        .notNull()
        .references(() => users.uid),

    ownerName: varchar("owner_name", { length: 100 }).notNull(),
    ownerRole: varchar("owner_role", { length: 20 }).default("owner").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ✅ Campus Members (many-to-many relation between users & campuses)
export const campusMembers = pgTable(
    "campus_members",
    {
        campusId: integer("campus_id")
            .notNull()
            .references(() => campuses.cid),
        userId: integer("user_id")
            .notNull()
            .references(() => users.uid),
        role: varchar("role", { length: 20 }).default("member").notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.campusId, table.userId] }),
    })
);

// ✅ Messages
export const messages = pgTable("messages", {
    mid: serial("mid").primaryKey(),
    campusId: integer("campus_id").notNull().references(() => campuses.cid),
    userId: integer("user_id").notNull().references(() => users.uid),
    text: text("text"),
    tag: varchar("tag", { length: 50 }).default("Message").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),

    // Reply info
    isReply: boolean("is_reply").default(false),
    replyToId: integer("reply_to_id").references(() => messages.mid),
    replyToUserId: integer("reply_to_user_id").references(() => users.uid),
    replyToUsername: text("reply_to_username"),
    replyToText: text("reply_to_text"),

    // Me Too
    meTooCount: integer("me_too_count").default(0).notNull(),
});

export const meToo = pgTable("me_too", {
    id: serial("id").primaryKey(),
    messageId: integer("message_id").notNull().references(() => messages.mid),
    userId: integer("user_id").notNull().references(() => users.uid),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const messageSeen = pgTable("message_seen", {
    id: serial("id").primaryKey(),
    messageId: integer("message_id").notNull().references(() => messages.mid),
    userId: integer("user_id").notNull().references(() => users.uid),
    seenAt: timestamp("seen_at").defaultNow().notNull(),
});



// ✅ Files
export const files = pgTable("files", {
    id: serial("id").primaryKey(),
    messageId: integer("message_id")
        .notNull()
        .references(() => messages.mid),
    filename: varchar("filename", { length: 255 }).notNull(),
    url: text("url").notNull(),
    fileType: varchar("file_type", { length: 20 }).default("other").notNull(),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});
