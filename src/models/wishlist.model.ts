import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { users } from "../models/users.model.js";
import { products } from "../models/products.model.js";
import { relations } from "drizzle-orm";

// Wishlist table
export const wishlist = pgTable("wishlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  product_id: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow(),
});

// Relations
export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, {
    fields: [wishlist.user_id],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlist.product_id],
    references: [products.id],
  }),
}));
