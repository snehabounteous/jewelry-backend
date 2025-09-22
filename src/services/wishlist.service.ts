import { db } from "../config/db.js";
import { wishlists, wishlist_items } from "../models/wishlist.model.js";
import { products } from "../models/products.model.js";
import { eq, and } from "drizzle-orm";

export async function getUserWishlist(userId: string) {
  const wishlistResult = await db.select().from(wishlists).where(eq(wishlists.user_id, userId)).execute();
  const wishlist = wishlistResult[0];

  if (!wishlist) return { items: [] };

  const itemsResult = await db
    .select({
      id: wishlist_items.id,
      product: products,
    })
    .from(wishlist_items)
    .leftJoin(products, eq(wishlist_items.product_id, products.id))
    .where(eq(wishlist_items.wishlist_id, wishlist.id))
    .execute();

  const items = itemsResult.map(row => ({
    id: row.id,
    product: row.product,
  }));

  return { ...wishlist, items };
}

export async function addToWishlist(userId: string, productId: string) {
  let product;
  try {
    const productResult = await db.select().from(products).where(eq(products.id, productId)).execute();
    product = productResult[0];
  } catch {
    throw new Error("Unable to fetch product");
  }
  if (!product) throw new Error(`Product with ID ${productId} does not exist`);

  let wishlistResult = await db.select().from(wishlists).where(eq(wishlists.user_id, userId)).execute();
  let wishlist = wishlistResult[0];
  if (!wishlist) {
    const inserted = await db.insert(wishlists).values({ user_id: userId }).returning().execute();
    wishlist = inserted[0];
  }

  const existingItems = await db
    .select()
    .from(wishlist_items)
    .where(and(eq(wishlist_items.wishlist_id, wishlist.id), eq(wishlist_items.product_id, productId)))
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
  const wishlistResult = await db.select().from(wishlists).where(eq(wishlists.user_id, userId)).execute();
  const wishlist = wishlistResult[0];
  if (!wishlist) throw new Error("Wishlist not found");

  const deleted = await db
    .delete(wishlist_items)
    .where(and(eq(wishlist_items.wishlist_id, wishlist.id), eq(wishlist_items.product_id, productId)))
    .returning()
    .execute();

  if (!deleted.length) throw new Error("Product not found in wishlist");
  return deleted[0];
}

export async function clearWishlist(userId: string) {
  const wishlistResult = await db.select().from(wishlists).where(eq(wishlists.user_id, userId)).execute();
  const wishlist = wishlistResult[0];
  if (!wishlist) return { items: [] };

  const deleted = await db.delete(wishlist_items).where(eq(wishlist_items.wishlist_id, wishlist.id)).returning().execute();
  return deleted;
}
