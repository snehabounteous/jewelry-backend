import { pgTable, serial, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user.model";
import { products } from "./products.model";

//////////////////////
// Wishlist Table
//////////////////////
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

//////////////////////
// Wishlist Items Table
//////////////////////
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  wishlistId: integer("wishlist_id").references(() => wishlists.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
});

//////////////////////
// TypeScript Types
//////////////////////
export type Wishlist = typeof wishlists.$inferSelect;
export type WishlistInsert = typeof wishlists.$inferInsert;

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type WishlistItemInsert = typeof wishlistItems.$inferInsert;
