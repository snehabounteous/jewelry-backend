// categories.service.ts
import { db } from "../config//db.js"; // your drizzle db instance
import { categories } from "../models/categories.model.js";
import { eq } from "drizzle-orm";

export class CategoriesService {
  async getAll() {
    return await db.select().from(categories);
  }

  async getById(id: string) {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return result[0] || null;
  }

  async create(data: { name: string; description?: string; slug: string }) {
    const result = await db
      .insert(categories)
      .values(data)
      .returning();
    return result[0];
  }

  async update(id: string, data: Partial<{ name: string; description: string; slug: string }>) {
    const result = await db
      .update(categories)
      .set({ ...data, updated_at: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string) {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }
}
