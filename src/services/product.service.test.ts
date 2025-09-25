// src/services/product.service.test.ts
import { ProductService } from "./product.service.js";
import { products } from "../models/products.model.js";
import { productImages } from "../models/productImages.model.js";

// Mock db object
const dbMock = {
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  execute: jest.fn(),
};

// Factory function for jest.mock
jest.mock("../config/db.js", () => ({
  db: dbMock,
}));

describe("ProductService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a product and insert images", async () => {
    const newProduct = { id: "p1", name: "Ring" };
    const images = [{ url: "img1" }];

    dbMock.returning.mockReturnThis();
    dbMock.execute.mockResolvedValue([newProduct]);

    const result = await ProductService.createProduct({
      name: "Ring",
      price: 100,
      category_id: "c1",
      images,
    });

    expect(dbMock.insert).toHaveBeenCalledWith(products);
    expect(dbMock.values).toHaveBeenCalled();
    expect(result).toEqual(newProduct);
  });

  it("should create a product without images", async () => {
    const newProduct = { id: "p2", name: "Necklace" };

    dbMock.returning.mockReturnThis();
    dbMock.execute.mockResolvedValue([newProduct]);

    const result = await ProductService.createProduct({
      name: "Necklace",
      price: 200,
      category_id: "c1",
    });

    expect(dbMock.insert).toHaveBeenCalledWith(products);
    expect(result).toEqual(newProduct);
  });

  it("should get all products", async () => {
    const mockProducts = [{ id: "p1" }, { id: "p2" }];
    dbMock.from.mockReturnThis();
    dbMock.execute.mockResolvedValue(mockProducts);

    const result = await ProductService.getAllProducts();

    expect(result).toEqual(mockProducts);
  });

  it("should get product by id with images", async () => {
    const mockProduct = { id: "p1", name: "Ring" };
    const mockImages = [{ url: "img1" }];

    dbMock.where.mockReturnThis();
    dbMock.execute.mockResolvedValueOnce([mockProduct]); // product
    dbMock.execute.mockResolvedValueOnce(mockImages); // images

    const result = await ProductService.getProductById("p1");

    expect(result).toEqual({ ...mockProduct, images: mockImages });
  });

  it("should return null if product not found", async () => {
    dbMock.execute.mockResolvedValue([]);

    const result = await ProductService.getProductById("not-exist");

    expect(result).toBeNull();
  });

  it("should update product and replace images", async () => {
    const updatedProduct = { id: "p1", name: "Updated" };

    dbMock.returning.mockReturnThis();
    dbMock.execute.mockResolvedValue([updatedProduct]);

    const result = await ProductService.updateProduct("p1", {
      name: "Updated",
      images: [{ url: "img2" }],
    });

    expect(result).toEqual(updatedProduct);
    expect(dbMock.delete).toHaveBeenCalledWith(productImages);
  });

  it("should delete product and its images", async () => {
    const deletedProduct = { id: "p1", name: "Ring" };

    dbMock.returning.mockReturnThis();
    dbMock.execute.mockResolvedValue([deletedProduct]);

    const result = await ProductService.deleteProduct("p1");

    expect(result).toEqual(deletedProduct);
    expect(dbMock.delete).toHaveBeenCalledWith(productImages);
  });
});
