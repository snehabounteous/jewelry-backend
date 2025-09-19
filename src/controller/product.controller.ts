// src/controller/product.controller.ts
import { Request, Response } from "express";
import { ProductService } from "../services/product.service.js";

export class ProductController {
  static async createProduct(req: Request, res: Response) {
    try {
      const product = await ProductService.createProduct(req.body);
      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ message: "Error creating product", error: err });
    }
  }

  static async getAllProducts(req: Request, res: Response) {
    try {
      const products = await ProductService.getAllProducts();
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: "Error fetching products", error: err });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "Error fetching product", error: err });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductService.updateProduct(id, req.body);
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "Error updating product", error: err });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductService.deleteProduct(id);
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "Error deleting product", error: err });
    }
  }
}
