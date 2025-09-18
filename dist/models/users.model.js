import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password_hash: text("password_hash").notNull(),
    role: text("role").default("customer"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
//# sourceMappingURL=users.model.js.map