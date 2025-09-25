import request from "supertest";
import express, { Express } from "express";
import * as cartController from "../controller/cart.controller.js";
import * as cartService from "../services/cart.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// Mock the cart service
jest.mock("../services/cart.service");

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());

  // Dummy auth middleware to inject a user into req
  app.use((req: AuthRequest, res, next) => {
    req.user = { id: "user-1", name: "Test User" } as any;
    next();
  });

  app.get("/cart", cartController.getCart);
  app.post("/cart/add", cartController.addItem);
  app.post("/cart/reduce", cartController.reduceItem);
  app.delete("/cart/remove/:productId", cartController.removeItem);
  app.delete("/cart/clear", cartController.clearCart);
});

describe("Cart Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCart", () => {
    it("should return the user's cart", async () => {
      (cartService.getUserCart as jest.Mock).mockResolvedValue([
        { product_id: "p1", quantity: 2 },
      ]);

      const res = await request(app).get("/cart");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ product_id: "p1", quantity: 2 }]);
      expect(cartService.getUserCart).toHaveBeenCalledWith("user-1");
    });

    it("should return 500 if service throws", async () => {
      (cartService.getUserCart as jest.Mock).mockRejectedValue(
        new Error("Failed")
      );

      const res = await request(app).get("/cart");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed");
    });
  });

  describe("addItem", () => {
    it("should add item to cart", async () => {
      (cartService.addToCart as jest.Mock).mockResolvedValue({
        product_id: "p1",
        quantity: 1,
      });

      const res = await request(app).post("/cart/add").send({
        product_id: "p1",
        quantity: 1,
      });

      expect(res.status).toBe(200);
      expect(res.body.product_id).toBe("p1");
      expect(cartService.addToCart).toHaveBeenCalledWith("user-1", "p1", 1);
    });

    it("should return 400 if product_id missing", async () => {
      const res = await request(app).post("/cart/add").send({ quantity: 1 });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Product ID is required");
    });

    it("should return 400 if quantity invalid", async () => {
      const res = await request(app)
        .post("/cart/add")
        .send({ product_id: "p1", quantity: 0 });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Quantity must be a positive number");
    });

    it("should handle product not found error", async () => {
      (cartService.addToCart as jest.Mock).mockRejectedValue(
        new Error("Product not found")
      );

      const res = await request(app).post("/cart/add").send({
        product_id: "p999",
        quantity: 1,
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Product with ID p999 does not exist");
    });

    it("should handle stock error", async () => {
      (cartService.addToCart as jest.Mock).mockRejectedValue(
        new Error("Cannot add more than stock")
      );

      const res = await request(app).post("/cart/add").send({
        product_id: "p1",
        quantity: 10,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Cannot add more than stock");
    });
  });

  describe("removeItem", () => {
    it("should remove an item from the cart", async () => {
      (cartService.removeFromCart as jest.Mock).mockResolvedValue({
        success: true,
      });

      const res = await request(app).delete("/cart/remove/p1");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(cartService.removeFromCart).toHaveBeenCalledWith("user-1", "p1");
    });

    it("should return 404 if cart not found", async () => {
      (cartService.removeFromCart as jest.Mock).mockRejectedValue(
        new Error("Cart not found")
      );

      const res = await request(app).delete("/cart/remove/p1");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Cart not found");
    });
  });

  describe("clearCart", () => {
    it("should clear the cart", async () => {
      (cartService.clearCart as jest.Mock).mockResolvedValue({ success: true });

      const res = await request(app).delete("/cart/clear");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(cartService.clearCart).toHaveBeenCalledWith("user-1");
    });

    it("should return 404 if cart not found", async () => {
      (cartService.clearCart as jest.Mock).mockRejectedValue(
        new Error("Cart not found")
      );

      const res = await request(app).delete("/cart/clear");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Cart not found");
    });
  });

  describe("reduceItem", () => {
    it("should reduce item quantity", async () => {
      (cartService.reduceCartItem as jest.Mock).mockResolvedValue({
        product_id: "p1",
        quantity: 1,
      });

      const res = await request(app).post("/cart/reduce").send({
        product_id: "p1",
        quantity: 1,
      });

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(1);
      expect(cartService.reduceCartItem).toHaveBeenCalledWith(
        "user-1",
        "p1",
        1
      );
    });

    it("should return 400 on error", async () => {
      (cartService.reduceCartItem as jest.Mock).mockRejectedValue(
        new Error("Cannot reduce below zero")
      );

      const res = await request(app).post("/cart/reduce").send({
        product_id: "p1",
        quantity: 5,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Cannot reduce below zero");
    });
  });
});
