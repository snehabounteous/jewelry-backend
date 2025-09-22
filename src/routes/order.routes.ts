import { Router } from "express";
import * as orderController from "../controller/order.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, orderController.getUserOrders);

router.get("/:orderId", authenticate, orderController.getOrderById);

router.post("/place", authenticate, orderController.placeOrder);

router.post("/buy-now", authenticate, orderController.buyNow);

router.post("/cancel/:orderId", authenticate, orderController.cancelOrder);

export default router;
