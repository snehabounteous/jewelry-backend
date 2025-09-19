// controllers/productsController.ts
import { Request, Response } from "express";
import { db } from "../db";
import { products } from "../models/products.model";
import { productImages } from "../models/prod";
import { eq } from "drizzle-orm";
import { CustomRequest } from "../middleware/injectUserId";

const isAdmin = (role?: string) => role === "admin";
const isSeller = (role?: string) => role === "seller";

// CREATE (seller only)
export const createProduct = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    if (!isSeller(req.role) && !isAdmin(req.role))
      return res.status(403).json({ message: "Only sellers/admins can create products" });

    const { name, description, price, category_id, stock, images } = req.body;

    const inserted = await db.insert(products).values({
      name,
      description,
      price,
      category_id,
      stock,
      seller_id: req.userId,
    }).returning();

    const product = inserted[0];

    if (Array.isArray(images) && images.length) {
      await db.insert(productImages).values(
        images.map((img: any) => ({
          product_id: product.id,
          url: img.url,
          alt_text: img.alt_text ?? null,
        })),
      );
    }

    res.status(201).json({ message: "Created", productId: product.id });
  } catch (e) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// LIST ALL (public)
export const getProducts = async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(products);
    res.json(list);
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// LIST MINE (seller/admin; admins can pass ?sellerId=...)
export const getMyProducts = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const targetSellerId =
      isAdmin(req.role) && req.query.sellerId ? String(req.query.sellerId) : req.userId;

    const list = await db.select().from(products).where(eq(products.seller_id, targetSellerId));
    res.json(list);
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET BY ID (public, with images)
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prod = await db.select().from(products).where(eq(products.id, id));
    if (!prod.length) return res.status(404).json({ message: "Not found" });
    const imgs = await db.select().from(productImages).where(eq(productImages.product_id, id));
    res.json({ ...prod[0], images: imgs });
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// UPDATE (owner or admin)
export const updateProduct = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;

    const existingArr = await db.select().from(products).where(eq(products.id, id));
    if (!existingArr.length) return res.status(404).json({ message: "Not found" });
    const existing = existingArr[0];

    const owner = existing.seller_id === req.userId;
    if (!owner && !isAdmin(req.role)) return res.status(403).json({ message: "Forbidden" });

    const { name, description, price, category_id, stock } = req.body;

    const updated = await db.update(products)
      .set({ name, description, price, category_id, stock, updated_at: new Date() })
      .where(eq(products.id, id))
      .returning();

    res.json({ message: "Updated", product: updated[0] });
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// DELETE (owner or admin)
export const deleteProduct = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;

    const existingArr = await db.select().from(products).where(eq(products.id, id));
    if (!existingArr.length) return res.status(404).json({ message: "Not found" });
    const existing = existingArr[0];

    const owner = existing.seller_id === req.userId;
    if (!owner && !isAdmin(req.role)) return res.status(403).json({ message: "Forbidden" });

    await db.delete(products).where(eq(products.id, id)); // images cascade if FK set
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// REPLACE IMAGES (owner/admin)
export const replaceProductImages = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    const { images } = req.body as { images: Array<{ url: string; alt_text?: string }> };

    const existingArr = await db.select().from(products).where(eq(products.id, id));
    if (!existingArr.length) return res.status(404).json({ message: "Not found" });
    const existing = existingArr[0];

    const owner = existing.seller_id === req.userId;
    if (!owner && !isAdmin(req.role)) return res.status(403).json({ message: "Forbidden" });

    await db.delete(productImages).where(eq(productImages.product_id, id));
    if (Array.isArray(images) && images.length) {
      await db.insert(productImages).values(
        images.map((img) => ({
          product_id: id,
          url: img.url,
          alt_text: img.alt_text ?? null,
        })),
      );
    }
    res.json({ message: "Images replaced" });
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
