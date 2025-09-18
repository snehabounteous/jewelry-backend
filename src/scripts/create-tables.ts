import { db } from "../config/db.js";
import { users } from "../models/users.model.js";
import { categories } from "../models/categories.model.js";
import { products } from "../models/products.model.js";
import { productImages } from "../models/productImages.model.js";
import { orders } from "../models/orders.model.js";
import { orderItems } from "../models/orderItems.model.js";
import { coupons } from "../models/coupons.model.js";
import { orderCoupons } from "../models/orderCoupons.model.js";
import { sql } from "drizzle-orm";

async function main() {
  try {
    const tables = [
      users,
      categories,
      products,
      productImages,
      orders,
      orderItems,
      coupons,
      orderCoupons,
    ];

    for (const table of tables) {
      await db.execute(sql`CREATE TABLE IF NOT EXISTS ${table}`);
      console.log(`Table ${table} created`);
    }

    console.log("All tables created successfully!");
  } catch (err) {
    console.error("Failed to create tables:", err);
  } finally {
    process.exit();
  }
}

main();
