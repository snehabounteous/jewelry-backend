import { Router } from "express";
import {createPaymentIntent} from "../controller/stripe.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/test", authenticate, createPaymentIntent);
export default router;