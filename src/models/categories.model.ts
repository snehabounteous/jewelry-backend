import { pgTable, serial, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";

//////////////////////
// Categories Table
//////////////////////
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

//////////////////////
// TypeScript Types
//////////////////////
export type Category = typeof categories.$inferSelect;
export type CategoryInsert = typeof categories.$inferInsert;
