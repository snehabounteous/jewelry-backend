// categories.controller.ts
import { Request, Response } from "express";
import { CategoriesService } from "..//services/categories.service.js";

const service = new CategoriesService();

export class CategoriesController {
  async getAll(req: Request, res: Response) {
    const data = await service.getAll();
    res.json(data);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const category = await service.getById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  }

  async create(req: Request, res: Response) {
    const { name, description, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: "Name and slug are required" });
    }
    const category = await service.create({ name, description, slug });
    res.status(201).json(category);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const category = await service.update(id, req.body);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const category = await service.delete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  }
}
