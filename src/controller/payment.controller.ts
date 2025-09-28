import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service.js";

export const PaymentController = {
  createPayment: async (req: Request, res: Response) => {
    try {
      const { order_id, stripe_payment_id, method, amount, currency, status, metadata } = req.body;

      if (!order_id || !stripe_payment_id || !method || !amount || !currency || !status) {
        return res.status(400).json({ message: "Missing required payment fields" });
      }

      const payment = await PaymentService.createPayment({
        order_id,
        stripe_payment_id,
        method,
        amount,
        currency,
        status,
        metadata,
      });

      return res.status(201).json({ payment });
    } catch (err: any) {
      console.error("PaymentController.createPayment error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getPaymentsByOrder: async (req: Request, res: Response) => {
    try {
      const { order_id } = req.params;
      const payments = await PaymentService.getPaymentByOrderId(order_id);
      res.json({ payments });
    } catch (err: any) {
      console.error("PaymentController.getPaymentsByOrder error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
