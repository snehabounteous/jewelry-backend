import express from "express";
import { db } from "./config/db.js";
const app = express();
app.get("/", async (_req, res) => {
    try {
        const result = await db.execute(`SELECT 1 AS test;`);
        res.send(`DB connected! Result: ${JSON.stringify(result)}`);
    }
    catch (err) {
        console.error("DB query failed:", err);
        res.status(500).send("Database query failed");
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map