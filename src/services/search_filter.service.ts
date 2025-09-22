import { db } from "../config/db.js";
import { products } from "../models/products.model.js";
import { and, gte, lte, like, eq, sql } from "drizzle-orm";

export class SearchFilterService {
  // Add filter entry (already done)
  async addFilter(filter: {
    product_id?: string | null;
    keyword?: string | null;
    category_id?: string | null;
    min_price?: number | null;
    max_price?: number | null;
    stock_min?: number | null;
    stock_max?: number | null;
  }) {
    // insert into productFilters table ...
  }

  // 🔍 Search products dynamically
  async searchProducts(filters: {
    keyword?: string;
    category_id?: string;
    min_price?: number;
    max_price?: number;
    stock_min?: number;
    stock_max?: number;
  }) {
    const conditions = [];

    if (filters.keyword) {
      conditions.push(
        like(products.name, `%${filters.keyword}%`)
      );
    }
    if (filters.category_id) {
      conditions.push(eq(products.category_id, filters.category_id));
    }
    if (filters.min_price !== undefined) {
      conditions.push(gte(products.price, filters.min_price.toString())); // numeric expects string
    }
    if (filters.max_price !== undefined) {
      conditions.push(lte(products.price, filters.max_price.toString()));
    }
    if (filters.stock_min !== undefined) {
      conditions.push(gte(products.stock, filters.stock_min));
    }
    if (filters.stock_max !== undefined) {
      conditions.push(lte(products.stock, filters.stock_max));
    }

    const query = db
      .select()
      .from(products)
      .where(conditions.length ? and(...conditions) : sql`TRUE`);

    return await query;
  }
}
