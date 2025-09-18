import { db } from '../config/db.js';
import { testTable } from "../models/test.js";
import { sql } from "drizzle-orm";
async function main() {
    try {
        await db.execute(sql `
      CREATE TABLE IF NOT EXISTS ${testTable} (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);
        console.log("✅ Test table created successfully!");
    }
    catch (err) {
        console.error("❌ Failed to create test table:", err);
    }
    finally {
        process.exit();
    }
}
main();
//# sourceMappingURL=create-test-table.js.map