import express from "express";
import cors from "cors";
import { db } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
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