import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import * as reviewService from "../services/review.service.js";

export async function addOrUpdateReview(req: AuthRequest, res: Response) {
  try {
    const { product_id, rating, comment } = req.body;
    const review = await reviewService.addOrUpdateReview(req.user!.id, product_id, rating, comment || "");
    res.json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function getProductReviews(req: AuthRequest, res: Response) {
  try {
    const { productId } = req.params;
    const reviews = await reviewService.getProductReviews(productId);
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getUserReview(req: AuthRequest, res: Response) {
  try {
    const { productId } = req.params;
    const review = await reviewService.getUserReview(req.user!.id, productId);
    res.json(review);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteReview(req: AuthRequest, res: Response) {
  try {
    const { productId } = req.params;
    const deleted = await reviewService.deleteReview(req.user!.id, productId);
    res.json(deleted);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
