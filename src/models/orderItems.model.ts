import { pgTable, uuid, integer, numeric } from "drizzle-orm/pg-core";
import { orders } from "./orders.model.js";
import { products } from "./products.model.js";

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),

  order_id: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  product_id: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),

  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(), // snapshot of product price at purchase time
});
