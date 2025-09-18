import { pgTable, serial, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user.model";
import { products } from "./products.model";

//////////////////////
// Cart Table
//////////////////////
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

//////////////////////
// Cart Items Table
//////////////////////
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").references(() => carts.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
});

//////////////////////
// TypeScript Types
//////////////////////
export type Cart = typeof carts.$inferSelect;
export type CartInsert = typeof carts.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type CartItemInsert = typeof cartItems.$inferInsert;
