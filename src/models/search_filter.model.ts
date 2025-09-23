import { pgTable, uuid, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";

export const productFilters = pgTable("product_filters", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Optional product_id
  product_id: uuid("product_id"),  

  // Filter/search fields
  keyword: text("keyword"),
  category_id: uuid("category_id"),
  min_price: numeric("min_price"),
  max_price: numeric("max_price"),
  stock_min: integer("stock_min"),
  stock_max: integer("stock_max"),

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
