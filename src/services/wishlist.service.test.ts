// src/services/wishlist.service.test.ts
import * as WishlistService from "./wishlist.service.js";
import { wishlists, wishlist_items } from "../models/wishlist.model.js";
import { products } from "../models/products.model.js";

// Mock db functions
const executeMock = jest.fn();
const dbMock = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockImplementation(() => ({ execute: executeMock })),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};

// Mock the db import
jest.mock("../config/db.js", () => ({
  db: dbMock,
}));

describe("WishlistService", () => {
  const userId = "user1";
  const productId = "prod1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserWishlist", () => {
    it("should return wishlist with items", async () => {
      const mockWishlist = { id: "w1", user_id: userId };
      const mockItems = [{ id: "i1", product: { id: productId, name: "Ring" } }];

      executeMock
        .mockResolvedValueOnce([mockWishlist]) // wishlist select
        .mockResolvedValueOnce(mockItems); // items select

      const result = await WishlistService.getUserWishlist(userId);

      expect(dbMock.select).toHaveBeenCalled();
      expect(result).toEqual({ ...mockWishlist, items: mockItems });
    });

    it("should return empty items if wishlist does not exist", async () => {
      executeMock.mockResolvedValue([]);

      const result = await WishlistService.getUserWishlist(userId);

      expect(result).toEqual({ items: [] });
    });
  });

  describe("addToWishlist", () => {
    it("should add a product to an existing wishlist", async () => {
      const mockProduct = { id: productId, name: "Ring" };
      const mockWishlist = { id: "w1", user_id: userId };
      const mockInsertedItem = { id: "i1", wishlist_id: "w1", product_id: productId };

      executeMock
        .mockResolvedValueOnce([mockProduct]) // product exists
        .mockResolvedValueOnce([mockWishlist]) // wishlist exists
        .mockResolvedValueOnce([]) // no existing item
        .mockResolvedValueOnce([mockInsertedItem]); // insert item

      const result = await WishlistService.addToWishlist(userId, productId);

      expect(dbMock.insert).toHaveBeenCalledWith(wishlist_items);
      expect(result).toEqual(mockInsertedItem);
    });

    it("should create a new wishlist if none exists", async () => {
      const mockProduct = { id: productId, name: "Ring" };
      const mockWishlist = { id: "w1", user_id: userId };
      const mockInsertedItem = { id: "i1", wishlist_id: "w1", product_id: productId };

      executeMock
        .mockResolvedValueOnce([mockProduct]) // product exists
        .mockResolvedValueOnce([]) // wishlist does not exist
        .mockResolvedValueOnce([mockWishlist]) // inserted wishlist
        .mockResolvedValueOnce([]) // no existing item
        .mockResolvedValueOnce([mockInsertedItem]); // insert item

      const result = await WishlistService.addToWishlist(userId, productId);

      expect(dbMock.insert).toHaveBeenCalledWith(wishlists);
      expect(dbMock.insert).toHaveBeenCalledWith(wishlist_items);
      expect(result).toEqual(mockInsertedItem);
    });

    it("should throw error if product already in wishlist", async () => {
      const mockProduct = { id: productId, name: "Ring" };
      const mockWishlist = { id: "w1", user_id: userId };
      const mockExistingItem = [{ id: "i1" }];

      executeMock
        .mockResolvedValueOnce([mockProduct])
        .mockResolvedValueOnce([mockWishlist])
        .mockResolvedValueOnce(mockExistingItem); // item already exists

      await expect(WishlistService.addToWishlist(userId, productId)).rejects.toThrow(
        "Product already in wishlist"
      );
    });
  });

  describe("removeFromWishlist", () => {
    it("should remove a product from wishlist", async () => {
      const mockWishlist = { id: "w1", user_id: userId };
      const mockDeletedItem = [{ id: "i1" }];

      executeMock
        .mockResolvedValueOnce([mockWishlist]) // get wishlist
        .mockResolvedValueOnce(mockDeletedItem); // delete item

      const result = await WishlistService.removeFromWishlist(userId, productId);

      expect(dbMock.delete).toHaveBeenCalledWith(wishlist_items);
      expect(result).toEqual(mockDeletedItem[0]);
    });

    it("should throw error if wishlist not found", async () => {
      executeMock.mockResolvedValueOnce([]);

      await expect(WishlistService.removeFromWishlist(userId, productId)).rejects.toThrow(
        "Wishlist not found"
      );
    });

    it("should throw error if product not in wishlist", async () => {
      const mockWishlist = { id: "w1", user_id: userId };

      executeMock
        .mockResolvedValueOnce([mockWishlist]) // get wishlist
        .mockResolvedValueOnce([]); // delete result empty

      await expect(WishlistService.removeFromWishlist(userId, productId)).rejects.toThrow(
        "Product not found in wishlist"
      );
    });
  });

  describe("clearWishlist", () => {
    it("should clear wishlist items", async () => {
      const mockWishlist = { id: "w1", user_id: userId };
      const mockDeletedItems = [{ id: "i1" }, { id: "i2" }];

      executeMock
        .mockResolvedValueOnce([mockWishlist]) // get wishlist
        .mockResolvedValueOnce(mockDeletedItems); // delete items

      const result = await WishlistService.clearWishlist(userId);

      expect(dbMock.delete).toHaveBeenCalledWith(wishlist_items);
      expect(result).toEqual(mockDeletedItems);
    });

    it("should return empty items if wishlist not found", async () => {
      executeMock.mockResolvedValueOnce([]);

      const result = await WishlistService.clearWishlist(userId);

      expect(result).toEqual({ items: [] });
    });
  });
});
