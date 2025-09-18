import "dotenv/config";
import { db } from "../config/db.js";
async function main() {
    try {
        const result = await db.execute(`SELECT 1 AS test;`);
        console.log("✅ DB connection works! Result:", result);
    }
    catch (err) {
        console.error("❌ DB connection failed:", err);
    }
}
main();
//# sourceMappingURL=test-db.js.map