import { Request, Response } from "express";
import { SearchFilterController } from "../controller/search_filter.controller.js";
import { SearchFilterService } from "../services/search_filter.service.js";

jest.mock("../services/search_filter.service.js");

describe("SearchFilterController", () => {
  let controller: SearchFilterController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  const mockResult = { id: "1", name: "Test Filter" };

  beforeEach(() => {
    controller = new SearchFilterController();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("addFilter", () => {
    it("should add a filter successfully", async () => {
      req.body = { name: "Filter1" };
      (SearchFilterService.prototype.addFilter as jest.Mock).mockResolvedValue(mockResult);

      await controller.addFilter(req as any, res as any);

      expect(SearchFilterService.prototype.addFilter).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("should return 500 on error", async () => {
      req.body = { name: "Filter1" };
      const error = new Error("Failed");
      (SearchFilterService.prototype.addFilter as jest.Mock).mockRejectedValue(error);

      await controller.addFilter(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
    });
  });

  describe("search", () => {
    it("should return search results successfully", async () => {
      req.query = {
        keyword: "ring",
        category_id: "cat1",
        min_price: "50",
        max_price: "500",
        stock_min: "1",
        stock_max: "10",
      };
      const mockResults = [{ id: "p1", name: "Product1" }];
      (SearchFilterService.prototype.searchProducts as jest.Mock).mockResolvedValue(mockResults);

      await controller.search(req as any, res as any);

      expect(SearchFilterService.prototype.searchProducts).toHaveBeenCalledWith({
        keyword: "ring",
        category_id: "cat1",
        min_price: 50,
        max_price: 500,
        stock_min: 1,
        stock_max: 10,
      });

      expect(res.json).toHaveBeenCalledWith(mockResults);
    });

    it("should handle optional query params correctly", async () => {
      req.query = { keyword: "ring" };
      const mockResults = [{ id: "p1", name: "Product1" }];
      (SearchFilterService.prototype.searchProducts as jest.Mock).mockResolvedValue(mockResults);

      await controller.search(req as any, res as any);

      expect(SearchFilterService.prototype.searchProducts).toHaveBeenCalledWith({
        keyword: "ring",
        category_id: undefined,
        min_price: undefined,
        max_price: undefined,
        stock_min: undefined,
        stock_max: undefined,
      });

      expect(res.json).toHaveBeenCalledWith(mockResults);
    });

    it("should return 500 on error", async () => {
      req.query = { keyword: "ring" };
      const error = new Error("Failed");
      (SearchFilterService.prototype.searchProducts as jest.Mock).mockRejectedValue(error);

      await controller.search(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
    });
  });
});
