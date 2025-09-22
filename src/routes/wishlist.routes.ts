import { Router } from "express";
import * as wishlistController from "../controller/wishlist.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, wishlistController.getWishlist);
router.post("/add", authenticate, wishlistController.addItem);
router.delete("/remove/:productId", authenticate, wishlistController.removeItem);
router.delete("/clear", authenticate, wishlistController.clearWishlist);

export default router;
