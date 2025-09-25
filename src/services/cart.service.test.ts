import { db } from "../config/db.js";
import * as cartService from "./cart.service.js";

// Mock the db object
jest.mock("../config/db.js", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  },
}));

describe("CartService", () => {
  const userId = "user1";
  const productId = "product1";

  const mockCart = { id: "cart1", user_id: userId };
  const insertedItem = { id: "item1", cart_id: "cart1", product_id: productId, quantity: 2 };
  const mockProduct = { id: productId, stock: 10 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addToCart", () => {
    it("should insert new cart item if none exists", async () => {
      // Mock selecting product
      (db.select as jest.Mock)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue([mockProduct]),
          }),
        })
        // Mock selecting cart (returns none so we create a new cart)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue([]),
          }),
        })
        // Mock selecting existing cart_items (none exist)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue([]),
          }),
        });

      // Mock insert for creating cart
      (db.insert as jest.Mock)
        .mockReturnValueOnce({
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue([mockCart]),
          }),
        })
        // Mock insert for creating cart item
        .mockReturnValueOnce({
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue([insertedItem]),
          }),
        });

      const result = await cartService.addToCart(userId, productId, 2);
      expect(result).toEqual(insertedItem);
    });
  });
});
