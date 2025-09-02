// server/drizzle.config.js
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./app/db/schema",   // Path to your schema
    out: "./app/db/migrations",     // Migration folder
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,   // Supabase / Postgres connection string
    },
});
