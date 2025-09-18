import { pgTable, uuid, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discount_type: text("discount_type").notNull(), // percentage or fixed
  discount_value: numeric("discount_value").notNull(),
  min_order: numeric("min_order"),
  max_uses: integer("max_uses"),
  used_count: integer("used_count").default(0),
  valid_from: timestamp("valid_from"),
  valid_to: timestamp("valid_to"),
  active: boolean("active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
