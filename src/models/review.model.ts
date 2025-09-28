import { pgTable, uuid, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users.model.js";
import { products } from "./products.model.js";

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    product_id: uuid("product_id").notNull().references(() => products.id),
    rating: integer("rating").notNull(),
    comment: text("comment").default(""),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    // Composite unique index on (user_id, product_id)
    uniqueIndex("user_product_unique").on(table.user_id, table.product_id),
  ]
);
