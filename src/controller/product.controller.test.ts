import { Request, Response } from "express";
import { ProductController } from "../controller/product.controller.js";
import { ProductService } from "../services/product.service.js";

jest.mock("../services/product.service.js");

describe("ProductController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  const mockProduct = {
    id: "1",
    name: "Test Product",
    price: 100,
    description: "A test product",
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("createProduct", () => {
    it("should create a product successfully", async () => {
      req.body = { name: "Test", price: 100 };
      (ProductService.createProduct as jest.Mock).mockResolvedValue(mockProduct);

      await ProductController.createProduct(req as any, res as any);

      expect(ProductService.createProduct).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    it("should return 500 on error", async () => {
      const error = new Error("Failed");
      (ProductService.createProduct as jest.Mock).mockRejectedValue(error);

      await ProductController.createProduct(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error creating product",
        error,
      });
    });
  });

  describe("getAllProducts", () => {
    it("should return all products", async () => {
      (ProductService.getAllProducts as jest.Mock).mockResolvedValue([mockProduct]);

      await ProductController.getAllProducts(req as any, res as any);

      expect(ProductService.getAllProducts).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith([mockProduct]);
    });

    it("should return 500 on error", async () => {
      const error = new Error("Failed");
      (ProductService.getAllProducts as jest.Mock).mockRejectedValue(error);

      await ProductController.getAllProducts(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching products",
        error,
      });
    });
  });

  describe("getProductById", () => {
    it("should return product by id", async () => {
      req.params = { id: "1" };
      (ProductService.getProductById as jest.Mock).mockResolvedValue(mockProduct);

      await ProductController.getProductById(req as any, res as any);

      expect(ProductService.getProductById).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    it("should return 404 if product not found", async () => {
      req.params = { id: "2" };
      (ProductService.getProductById as jest.Mock).mockResolvedValue(null);

      await ProductController.getProductById(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
    });

    it("should return 500 on error", async () => {
      req.params = { id: "1" };
      const error = new Error("Failed");
      (ProductService.getProductById as jest.Mock).mockRejectedValue(error);

      await ProductController.getProductById(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching product",
        error,
      });
    });
  });

  describe("updateProduct", () => {
    it("should update product successfully", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated" };
      const updatedProduct = { ...mockProduct, name: "Updated" };
      (ProductService.updateProduct as jest.Mock).mockResolvedValue(updatedProduct);

      await ProductController.updateProduct(req as any, res as any);

      expect(ProductService.updateProduct).toHaveBeenCalledWith("1", req.body);
      expect(res.json).toHaveBeenCalledWith(updatedProduct);
    });

    it("should return 500 on error", async () => {
      req.params = { id: "1" };
      const error = new Error("Failed");
      (ProductService.updateProduct as jest.Mock).mockRejectedValue(error);

      await ProductController.updateProduct(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error updating product",
        error,
      });
    });
  });

  describe("deleteProduct", () => {
    it("should delete product successfully", async () => {
      req.params = { id: "1" };
      (ProductService.deleteProduct as jest.Mock).mockResolvedValue(mockProduct);

      await ProductController.deleteProduct(req as any, res as any);

      expect(ProductService.deleteProduct).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    it("should return 500 on error", async () => {
      req.params = { id: "1" };
      const error = new Error("Failed");
      (ProductService.deleteProduct as jest.Mock).mockRejectedValue(error);

      await ProductController.deleteProduct(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error deleting product",
        error,
      });
    });
  });
});
