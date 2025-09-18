// src/server.ts
import "dotenv/config";
import express from "express";
import { neon } from "@neondatabase/serverless";
// Create Express app
const app = express();
// Neon query function
if (!process.env.DATABASE_URL)
    throw new Error("Missing DATABASE_URL");
const sql = neon(process.env.DATABASE_URL);
// Test route
app.get("/", async (_req, res) => {
    try {
        const result = await sql `SELECT version()`;
        const { version } = result[0];
        res.send(`DB Version: ${version}`);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Database query failed");
    }
});
// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map