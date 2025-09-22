import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

export const wishlists = pgTable("wishlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const wishlist_items = pgTable("wishlist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  wishlist_id: uuid("wishlist_id").notNull(),
  product_id: uuid("product_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
