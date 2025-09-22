import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import * as wishlistService from "../services/wishlist.service.js";

export async function getWishlist(req: AuthRequest, res: Response) {
  try {
    const wishlist = await wishlistService.getUserWishlist(req.user!.id);
    res.json(wishlist);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Unable to fetch wishlist" });
  }
}

export async function addItem(req: AuthRequest, res: Response) {
  try {
    const { product_id } = req.body;
    const item = await wishlistService.addToWishlist(req.user!.id, product_id);
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Unable to add product to wishlist" });
  }
}

export async function removeItem(req: AuthRequest, res: Response) {
  try {
    const { productId } = req.params;
    const result = await wishlistService.removeFromWishlist(req.user!.id, productId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Unable to remove product from wishlist" });
  }
}

export async function clearWishlist(req: AuthRequest, res: Response) {
  try {
    const result = await wishlistService.clearWishlist(req.user!.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Unable to clear wishlist" });
  }
}
