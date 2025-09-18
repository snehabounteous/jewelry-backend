import { pgTable, serial, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { products } from "./products.model.js";

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  product_id: uuid("product_id").references(() => products.id),
  url: text("url").notNull(),
  alt_text: text("alt_text"),
  created_at: timestamp("created_at").defaultNow(),
});
