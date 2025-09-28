import { db } from "../config/db.js";
import { wishlists, wishlist_items } from "../models/wishlist.model.js";
import { eq, and, sql } from "drizzle-orm";
import { productImages } from "../models/productImages.model.js";
import { reviews } from "../models/review.model.js";
import { products } from "../models/products.model.js";

interface ProductImageType {
  id: string;
  product_id: string | null;
  url: string;
  alt_text: string | null;
  created_at: Date | null;
}

interface ReviewType {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

interface ProductType {
  id: string;
  name: string;
  description: string | null;
  price: string;
  category_id: string | null;
  stock: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  images: ProductImageType[];
  reviews: ReviewType[];
}

interface WishlistItemType {
  id: string;
  product: ProductType;
}

export async function getUserWishlist(userId: string) {
  // 1️⃣ Fetch wishlist for the user
  const wishlistResult = await db
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(eq(wishlists.user_id, userId))
    .execute();

  const wishlist = wishlistResult[0];
  if (!wishlist) return { items: [] };

  // 2️⃣ Fetch all wishlist items (products) with images & reviews using JSON aggregation
  const wishlistedProducts = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      category_id: products.category_id,
      stock: products.stock,
      created_at: products.created_at,
      updated_at: products.updated_at,
      images: sql`COALESCE(json_agg(DISTINCT product_images.*) FILTER (WHERE product_images.id IS NOT NULL), '[]')`,
      reviews: sql`COALESCE(json_agg(DISTINCT reviews.*) FILTER (WHERE reviews.id IS NOT NULL), '[]')`,
    })
    .from(wishlist_items)
    .leftJoin(products, eq(wishlist_items.product_id, products.id))
    .leftJoin(productImages, eq(productImages.product_id, products.id))
    .leftJoin(reviews, eq(reviews.product_id, products.id))
    .where(eq(wishlist_items.wishlist_id, wishlist.id))
    .groupBy(products.id)
    .execute();

  return {
    id: wishlist.id,
    items: wishlistedProducts,
  };
}

export async function addToWishlist(userId: string, productId: string) {
  let product;
  try {
    const productResult = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .execute();
    product = productResult[0];
  } catch {
    throw new Error("Unable to fetch product");
  }
  if (!product) throw new Error(`Product with ID ${productId} does not exist`);

  let wishlistResult = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.user_id, userId))
    .execute();
  let wishlist = wishlistResult[0];
  if (!wishlist) {
    const inserted = await db
      .insert(wishlists)
      .values({ user_id: userId })
      .returning()
      .execute();
    wishlist = inserted[0];
  }

  const existingItems = await db
    .select()
    .from(wishlist_items)
    .where(
      and(
        eq(wishlist_items.wishlist_id, wishlist.id),
        eq(wishlist_items.product_id, productId)
      )
    )
    .execute();

  if (existingItems.length > 0) throw new Error("Product already in wishlist");

  const insertedItem = await db
    .insert(wishlist_items)
    .values({ wishlist_id: wishlist.id, product_id: productId })
    .returning()
    .execute();

  return insertedItem[0];
}

export async function removeFromWishlist(userId: string, productId: string) {
  const wishlistResult = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.user_id, userId))
    .execute();
  const wishlist = wishlistResult[0];
  if (!wishlist) throw new Error("Wishlist not found");

  const deleted = await db
    .delete(wishlist_items)
    .where(
      and(
        eq(wishlist_items.wishlist_id, wishlist.id),
        eq(wishlist_items.product_id, productId)
      )
    )
    .returning()
    .execute();

  if (!deleted.length) throw new Error("Product not found in wishlist");
  return deleted[0];
}

export async function clearWishlist(userId: string) {
  const wishlistResult = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.user_id, userId))
    .execute();
  const wishlist = wishlistResult[0];
  if (!wishlist) return { items: [] };

  const deleted = await db
    .delete(wishlist_items)
    .where(eq(wishlist_items.wishlist_id, wishlist.id))
    .returning()
    .execute();
  return deleted;
}
