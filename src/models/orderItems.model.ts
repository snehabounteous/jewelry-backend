import { pgTable, uuid, serial, integer, numeric } from "drizzle-orm/pg-core";
import { orders } from "./orders.model.js";
import { products } from "./products.model.js";

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  order_id: uuid("order_id").notNull().references(() => orders.id),
  product_id: uuid("product_id").notNull().references(() => products.id), 
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(),
});
