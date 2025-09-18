import { pgTable, uuid, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.model.js";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id),
  total_amount: numeric("total_amount").notNull(),
  status: text("status").default("pending"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
