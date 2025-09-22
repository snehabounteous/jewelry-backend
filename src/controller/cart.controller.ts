import { Request, Response } from "express";
import * as cartService from "../services/cart.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export async function getCart(req: AuthRequest, res: Response) {
  try {
    const cart = await cartService.getUserCart(req.user!.id);
    res.json(cart);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch cart" });
  }
}

export async function addItem(req: AuthRequest, res: Response) {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    if (quantity !== undefined && (typeof quantity !== "number" || quantity <= 0)) {
      return res.status(400).json({ error: "Quantity must be a positive number" });
    }

    const item = await cartService.addToCart(
      req.user!.id,
      product_id,
      quantity || 1
    );

    res.json(item);
  } catch (err: any) {
    // Handle product not found
    if (err.message.includes("Product not found")) {
      return res.status(404).json({ error: `Product with ID ${req.body.product_id} does not exist` });
    }
    // Handle stock issues
    if (err.message.includes("Cannot add")) {
      return res.status(400).json({ error: err.message });
    }
    // Fallback for other errors
    return res.status(500).json({ error: err.message || "Failed to add item to cart" });
  }
}


export async function removeItem(req: AuthRequest, res: Response) {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const result = await cartService.removeFromCart(req.user!.id, productId);
    res.json(result);
  } catch (err: any) {
    if (err.message.includes("Cart not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message || "Failed to remove item from cart" });
    }
  }
}

export async function clearCart(req: AuthRequest, res: Response) {
  try {
    const result = await cartService.clearCart(req.user!.id);
    res.json(result);
  } catch (err: any) {
    if (err.message.includes("Cart not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message || "Failed to clear cart" });
    }
  }
}

export async function reduceItem(req: AuthRequest, res: Response) {
  try {
    const { product_id, quantity } = req.body;
    const result = await cartService.reduceCartItem(req.user!.id, product_id, quantity || 1);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
