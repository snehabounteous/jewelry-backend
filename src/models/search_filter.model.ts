import { pgTable, uuid, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { products } from "./products.model.js";

// Optional table for saved searches or filter history
export const productFilters = pgTable("product_filters", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Optional: tie filter to a product (or null if generic search)
  product_id: uuid("product_id").references(() => products.id).default(null),

  // Filter/search fields
  keyword: text("keyword"),           // Search by product name or description
  category_id: uuid("category_id").references(() => products.category_id).default(""), // Filter by category
  min_price: numeric("min_price").default(null),   // Minimum price
  max_price: numeric("max_price").default(null),   // Maximum price
  stock_min: integer("stock_min").default(null),   // Minimum stock
  stock_max: integer("stock_max").default(null),    // Maximum stock

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
