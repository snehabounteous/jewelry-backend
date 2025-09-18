import { pgTable, serial, integer, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user.model";
import { products } from "./products.model";

//////////////////////
// Reviews / Ratings Table
//////////////////////
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 scale
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

//////////////////////
// TypeScript Types
//////////////////////
export type Review = typeof reviews.$inferSelect;
export type ReviewInsert = typeof reviews.$inferInsert;
