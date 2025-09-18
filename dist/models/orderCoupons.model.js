import { pgTable, numeric, uuid } from "drizzle-orm/pg-core";
import { orders } from "./orders.model.js";
import { coupons } from "./coupons.model.js";
export const orderCoupons = pgTable("order_coupons", {
    id: uuid("id").defaultRandom().primaryKey(),
    order_id: uuid("order_id").notNull().references(() => orders.id),
    coupon_id: uuid("coupon_id").references(() => coupons.id),
    discount_applied: numeric("discount_applied").notNull(),
});
//# sourceMappingURL=orderCoupons.model.js.map