import { Request, Response } from "express";
import * as orderService from "../services/order.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// Place order (from cart)
export async function placeOrder(req: AuthRequest, res: Response) {
  try {
    const { addressId, contact, shipping, shippingMethod, shippingCost } = req.body;

    const payload = {
      userId: req.user!.id,
      options: {
        addressId,
        contact,
        shipping,
        shippingMethod,
        shippingCost,
      },
    };

    const result = await orderService.placeOrder(payload);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Buy now (single product)
export async function buyNow(req: AuthRequest, res: Response) {
  try {
    const { product_id, quantity = 1, addressId, contact, shipping, shippingMethod, shippingCost } = req.body;

    if (!addressId && !(contact && shipping)) {
      return res.status(400).json({ error: "Order details (address or contact+shipping) are required" });
    }

    const options = { addressId, contact, shipping, shippingMethod, shippingCost };

    const result = await orderService.buyNow(req.user!.id, product_id, quantity, options);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Get all user orders
export async function getUserOrders(req: AuthRequest, res: Response) {
  try {
    const orders = await orderService.getUserOrders(req.user!.id);
    res.json(orders);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Get order by ID
export async function getOrderById(req: AuthRequest, res: Response) {
  try {
    const orderId = req.params.orderId;
    const order = await orderService.getOrderById(req.user!.id, orderId);
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Cancel order
export async function cancelOrder(req: AuthRequest, res: Response) {
  try {
    const orderId = req.params.orderId;
    const result = await orderService.cancelOrder(req.user!.id, orderId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
