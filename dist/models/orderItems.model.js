import { pgTable, uuid, integer, numeric } from "drizzle-orm/pg-core";
import { orders } from "./orders.model.js";
import { products } from "./products.model.js";
export const orderItems = pgTable("order_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    order_id: uuid("order_id").notNull().references(() => orders.id),
    product_id: uuid("product_id").notNull().references(() => products.id), // <-- change to uuid
    quantity: integer("quantity").notNull(),
    price: numeric("price").notNull(),
});
//# sourceMappingURL=orderItems.model.js.map