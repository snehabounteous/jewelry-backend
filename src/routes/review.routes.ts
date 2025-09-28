import { Router } from "express";
import * as reviewController from "../controller/review.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, reviewController.addOrUpdateReview);
router.get("/product/:productId", reviewController.getProductReviews);
router.get("/product/:productId/user", authenticate, reviewController.getUserReview);
router.delete("/product/:productId", authenticate, reviewController.deleteReview);

export default router;
