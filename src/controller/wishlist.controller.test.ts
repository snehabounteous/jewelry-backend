import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import * as wishlistService from "../services/wishlist.service.js";
import { getWishlist, addItem, removeItem, clearWishlist } from "../controller/wishlist.controller.js";

jest.mock("../services/wishlist.service.js");

describe("WishlistController", () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  const mockUserId = "user1";
  const mockWishlistItem = { id: "p1", name: "Product1" };

  beforeEach(() => {
    req = { user: { id: mockUserId } } as Partial<AuthRequest>;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getWishlist", () => {
    it("should return the user's wishlist", async () => {
      (wishlistService.getUserWishlist as jest.Mock).mockResolvedValue([mockWishlistItem]);

      await getWishlist(req as any, res as any);

      expect(wishlistService.getUserWishlist).toHaveBeenCalledWith(mockUserId);
      expect(res.json).toHaveBeenCalledWith([mockWishlistItem]);
    });

    it("should return 500 on error", async () => {
      const error = new Error("Failed");
      (wishlistService.getUserWishlist as jest.Mock).mockRejectedValue(error);

      await getWishlist(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
    });
  });

  describe("addItem", () => {
    it("should add item to wishlist successfully", async () => {
      req.body = { product_id: "p1" };
      (wishlistService.addToWishlist as jest.Mock).mockResolvedValue(mockWishlistItem);

      await addItem(req as any, res as any);

      expect(wishlistService.addToWishlist).toHaveBeenCalledWith(mockUserId, "p1");
      expect(res.json).toHaveBeenCalledWith(mockWishlistItem);
    });

    it("should return 400 on error", async () => {
      req.body = { product_id: "p1" };
      const error = new Error("Failed");
      (wishlistService.addToWishlist as jest.Mock).mockRejectedValue(error);

      await addItem(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
    });
  });

  describe("removeItem", () => {
    it("should remove item from wishlist successfully", async () => {
      req.params = { productId: "p1" };
      (wishlistService.removeFromWishlist as jest.Mock).mockResolvedValue({ success: true });

      await removeItem(req as any, res as any);

      expect(wishlistService.removeFromWishlist).toHaveBeenCalledWith(mockUserId, "p1");
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("should return 400 on error", async () => {
      req.params = { productId: "p1" };
      const error = new Error("Failed");
      (wishlistService.removeFromWishlist as jest.Mock).mockRejectedValue(error);

      await removeItem(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
    });
  });

  describe("clearWishlist", () => {
    it("should clear the wishlist successfully", async () => {
      (wishlistService.clearWishlist as jest.Mock).mockResolvedValue({ success: true });

      await clearWishlist(req as any, res as any);

      expect(wishlistService.clearWishlist).toHaveBeenCalledWith(mockUserId);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("should return 400 on error", async () => {
      const error = new Error("Failed");
      (wishlistService.clearWishlist as jest.Mock).mockRejectedValue(error);

      await clearWishlist(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
    });
  });
});
