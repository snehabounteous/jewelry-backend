import { Request, Response } from "express";
import { SearchFilterService } from "../services/search_filter.service.js";

const service = new SearchFilterService();

export class SearchFilterController {
  // Save a filter entry (optional)
  async addFilter(req: Request, res: Response) {
    try {
      const filter = req.body;
      const result = await service.addFilter(filter);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Perform search
  async search(req: Request, res: Response) {
    try {
      const filters = req.query; // comes as strings
      const results = await service.searchProducts({
        keyword: filters.keyword as string,
        category_id: filters.category_id as string,
        min_price: filters.min_price ? Number(filters.min_price) : undefined,
        max_price: filters.max_price ? Number(filters.max_price) : undefined,
        stock_min: filters.stock_min ? Number(filters.stock_min) : undefined,
        stock_max: filters.stock_max ? Number(filters.stock_max) : undefined,
      });
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
