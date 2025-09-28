import { Router } from "express";
import { PaymentController } from "../controller/payment.controller.js";

const router = Router();

// Create payment (usually called from order placement)
router.post("/", PaymentController.createPayment);

// Get payments for a specific order
router.get("/order/:order_id", PaymentController.getPaymentsByOrder);

export default router;
