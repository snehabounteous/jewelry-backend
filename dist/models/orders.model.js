import { pgTable, uuid, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.model.js";
import { addresses } from "./address.model.js";
export const orders = pgTable("orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    // Link to user
    user_id: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    // Always linked to an address
    address_id: uuid("address_id")
        .notNull()
        .references(() => addresses.id, { onDelete: "restrict" }),
    // Redundant snapshot fields (denormalization for history)
    first_name: text("first_name").notNull(),
    last_name: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    street_address: text("street_address").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    zip: text("zip").notNull(),
    country: text("country").notNull(),
    // Order details
    total_amount: numeric("total_amount").notNull(),
    status: text("status").default("pending"), // pending | paid | shipped | delivered | cancelled
    // Shipping info
    shipping_method: text("shipping_method").notNull(),
    shipping_cost: numeric("shipping_cost").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
//# sourceMappingURL=orders.model.js.map