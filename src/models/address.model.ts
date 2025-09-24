import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.model.js";

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),

  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  street_address: text("street_address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  country: text("country").notNull(),

  is_default: boolean("is_default").default(false).notNull(),

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
