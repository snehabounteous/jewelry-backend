import express from "express";
import cors from "cors";
import { db } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.get("/", async (_req, res) => {
    try {
        const result = await db.execute(`SELECT 1 AS test;`);
        res.json({ result });
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Database query failed");
    }
});
export default app;
//# sourceMappingURL=app.js.map