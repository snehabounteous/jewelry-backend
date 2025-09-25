// src/services/search_filter.service.test.ts
import { SearchFilterService } from "./search_filter.service.js";
import { products } from "../models/products.model.js";

// Define the executeMock first
const executeMock = jest.fn();

// Mock the db import properly
jest.mock("../config/db.js", () => {
  return {
    db: {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockImplementation(() => ({ execute: executeMock })),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      execute: executeMock,
    },
  };
});

describe("SearchFilterService", () => {
  let service: SearchFilterService;
  let db: any;

  beforeEach(() => {
    service = new SearchFilterService();
    db = require("../config/db.js").db;
    jest.clearAllMocks();
  });

  it("should return all products when no filters are provided", async () => {
    const mockProducts = [{ id: "p1" }, { id: "p2" }];
    executeMock.mockResolvedValue(mockProducts);

    const result = await service.searchProducts({});

    expect(db.select).toHaveBeenCalled();
    expect(db.from).toHaveBeenCalledWith(products);
    expect(db.where).toHaveBeenCalled();
    expect(result).toEqual(mockProducts);
  });

  it("should filter by keyword", async () => {
    const mockProducts = [{ id: "p1", name: "Ring" }];
    executeMock.mockResolvedValue(mockProducts);

    const result = await service.searchProducts({ keyword: "ring" });

    expect(db.where).toHaveBeenCalled();
    expect(result).toEqual(mockProducts);
  });

  it("should filter by category_id", async () => {
    const mockProducts = [{ id: "p2", category_id: "c1" }];
    executeMock.mockResolvedValue(mockProducts);

    const result = await service.searchProducts({ category_id: "c1" });

    expect(db.where).toHaveBeenCalled();
    expect(result).toEqual(mockProducts);
  });

  it("should filter by price range", async () => {
    const mockProducts = [{ id: "p3", price: "150" }];
    executeMock.mockResolvedValue(mockProducts);

    const result = await service.searchProducts({ min_price: 100, max_price: 200 });

    expect(db.where).toHaveBeenCalled();
    expect(result).toEqual(mockProducts);
  });

  it("should filter by stock range", async () => {
    const mockProducts = [{ id: "p4", stock: 10 }];
    executeMock.mockResolvedValue(mockProducts);

    const result = await service.searchProducts({ stock_min: 5, stock_max: 20 });

    expect(db.where).toHaveBeenCalled();
    expect(result).toEqual(mockProducts);
  });

  it("should apply multiple filters together", async () => {
    const mockProducts = [
      { id: "p5", name: "Ring", price: "150", stock: 10, category_id: "c1" },
    ];
    executeMock.mockResolvedValue(mockProducts);

    const result = await service.searchProducts({
      keyword: "ring",
      category_id: "c1",
      min_price: 100,
      max_price: 200,
      stock_min: 5,
      stock_max: 15,
    });

    expect(db.where).toHaveBeenCalled();
    expect(result).toEqual(mockProducts);
  });

  it("should call db.insert when addFilter is called", async () => {
    executeMock.mockResolvedValue({}); // dummy return
    const filter = { keyword: "ring", min_price: 100 };

    await service.addFilter(filter);

    expect(db.insert).toHaveBeenCalled();
    expect(db.values).toHaveBeenCalledWith(expect.objectContaining(filter));
  });
});
