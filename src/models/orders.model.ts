import { pgTable, serial, integer, timestamp, uuid, varchar, numeric } from "drizzle-orm/pg-core";
import { users } from "./user.model";
import { products } from "./products.model";

//////////////////////
// Orders Table
//////////////////////
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // e.g., pending, shipped, delivered
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

//////////////////////
// Order Items Table
//////////////////////
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(), // store price at the time of order
});

//////////////////////
// TypeScript Types
//////////////////////
export type Order = typeof orders.$inferSelect;
export type OrderInsert = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type OrderItemInsert = typeof orderItems.$inferInsert;
