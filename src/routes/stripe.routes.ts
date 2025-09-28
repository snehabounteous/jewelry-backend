import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createPaymentIntent } from "../controller/stripe.controller.js";
const router = Router();


router.post("/create-payment-intent", createPaymentIntent);
export default router;