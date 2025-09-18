import { pgTable, uuid, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { categories } from "./categories.model.js";
export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    price: numeric("price").notNull(),
    category_id: uuid("category_id").references(() => categories.id),
    stock: integer("stock").default(0),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
//# sourceMappingURL=products.model.js.map