import { db } from "../config/db.js";
import { payments } from "../models/payment.model.js";
import { eq } from "drizzle-orm";

export const PaymentService = {
  createPayment: async (paymentData: {
    order_id: string;
    stripe_payment_id: string;
    method: string;
    amount: number;
    currency: string;
    status: string;
    metadata?: any;
  }) => {
    const payment = await db.insert(payments).values(paymentData).returning();
    return payment[0];
  },

  getPaymentByOrderId: async (order_id: string) => {
    return db.select().from(payments).where(eq(payments.order_id,order_id));
  },

  getPaymentById: async (id: string) => {
    return db.select().from(payments).where(eq(payments.id,id)).limit(1);
  },
};
