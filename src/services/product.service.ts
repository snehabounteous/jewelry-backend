// src/services/product.service.ts
import { db } from "../config/db.js";
import { products } from "../models/products.model.js";
import { productImages } from "../models/productImages.model.js";
import { eq } from "drizzle-orm";

export class ProductService {
  // ✅ Create a product
  static async createProduct(data: {
    name: string;
    description?: string;
    price: number; // API expects number
    category_id: string;
    stock?: number;
    images?: { url: string; alt_text?: string }[];
  }) {
    const [newProduct] = await db
      .insert(products)
      .values({
        name: data.name,
        description: data.description,
        price: data.price.toString(), // ✅ always store as string
        category_id: data.category_id,
        stock: data.stock ?? 0,
      })
      .returning();

    if (data.images && data.images.length > 0) {
      await db.insert(productImages).values(
        data.images.map((img) => ({
          product_id: newProduct.id,
          url: img.url,
          alt_text: img.alt_text,
        }))
      );
    }

    return newProduct;
  }

  // ✅ Fetch all products
  static async getAllProducts() {
    return await db.select().from(products);
  }

  // ✅ Fetch single product + its images
  static async getProductById(id: string) {
    const productRows = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    const product = productRows[0];
    if (!product) return null;

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.product_id, id));

    return { ...product, images };
  }

  // ✅ Update product
  static async updateProduct(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      category_id?: string;
      stock?: number;
      images?: { url: string; alt_text?: string }[];
    }
  ) {
    // Convert price (if provided) from number → string
    const dbData: any = { ...data };
    if (typeof data.price === "number") {
      dbData.price = data.price.toString();
    }

    const [updated] = await db
      .update(products)
      .set(dbData)
      .where(eq(products.id, id))
      .returning();

    // If images provided → replace old ones
    if (data.images) {
      await db.delete(productImages).where(eq(productImages.product_id, id));
      if (data.images.length > 0) {
        await db.insert(productImages).values(
          data.images.map((img) => ({
            product_id: id,
            url: img.url,
            alt_text: img.alt_text,
          }))
        );
      }
    }

    return updated;
  }

  // ✅ Delete product + its images
  static async deleteProduct(id: string) {
    await db.delete(productImages).where(eq(productImages.product_id, id));
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    return deleted;
  }
}
