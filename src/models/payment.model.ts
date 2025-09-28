import { pgTable, serial, text, uuid, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { db } from "../config/db.js";

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  order_id: uuid("order_id").notNull(),
  stripe_payment_id: text("stripe_payment_id").notNull(),
  method: text("method").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull(),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()),
});
