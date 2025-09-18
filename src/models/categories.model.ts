import { pgTable, uuid, serial, text, timestamp } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),        // OK as integer if not referenced elsewhere
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
