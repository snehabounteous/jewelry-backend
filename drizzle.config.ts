import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./models", // path to your drizzle schema (tables)
  out: "./drizzle",   // where migrations will be stored
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // from .env
  },
});
