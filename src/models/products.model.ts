import { pgTable, uuid, varchar, text, decimal, integer, timestamp } from "drizzle-orm/pg-core";
import { categories } from "./categories.model"; // assumes you’ll create category.model.ts

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0).notNull(),

  // Relation: each product belongs to one category
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
