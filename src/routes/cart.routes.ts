import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import * as cartController from "../controller/cart.controller.js";

const router = Router();

router.get("/", authenticate, cartController.getCart);
router.post("/add", authenticate, cartController.addItem);
router.delete("/remove/:productId", authenticate, cartController.removeItem);
router.delete("/clear", authenticate, cartController.clearCart);
router.post("/reduce", authenticate, cartController.reduceItem);


export default router;
