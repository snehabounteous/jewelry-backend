import { db } from "../config/db.js";
import { carts, cart_items } from "../models/cart.model.js";
import { eq, and } from "drizzle-orm";
import { products } from "../models/products.model.js";

export async function getUserCart(userId: string) {
  const cartResult = await db.select().from(carts).where(eq(carts.user_id, userId)).execute();
  const cart = cartResult[0];
  if (!cart) return { items: [] };

  const itemsResult = await db
    .select({
      id: cart_items.id,
      quantity: cart_items.quantity,
      product: products, 
    })
    .from(cart_items)
    .leftJoin(products, eq(cart_items.product_id, products.id))
    .where(eq(cart_items.cart_id, cart.id))
    .execute();

  const items = itemsResult.map(row => ({
    id: row.id,
    quantity: row.quantity,
    product: row.product,
  }));

  return { ...cart, items };
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  if (quantity <= 0) throw new Error("Quantity must be greater than zero");

  let product;
  try {
    const productResult = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .execute();
    product = productResult[0];
  } catch (err) {
    throw new Error(`Failed to fetch product: ${productId}`);
  }

  if (!product) {
    throw new Error(`Product with ID ${productId} does not exist`);
  }

  // Get or create cart
  let cartResult = await db.select().from(carts).where(eq(carts.user_id, userId)).execute();
  let cart = cartResult[0];
  if (!cart) {
    const inserted = await db.insert(carts).values({ user_id: userId }).returning().execute();
    cart = inserted[0];
  }

  // Check if item exists
  const existingItems = await db
    .select()
    .from(cart_items)
    .where(and(eq(cart_items.cart_id, cart.id), eq(cart_items.product_id, productId)))
    .execute();
  const existingItem = existingItems[0];

  if (existingItem) {
    const totalQuantity = existingItem.quantity + quantity;
    if (product.stock !== null && totalQuantity > product.stock) {
      throw new Error(`Cannot add ${quantity} items. Only ${product.stock - existingItem.quantity} more in stock.`);
    }
    const updated = await db
      .update(cart_items)
      .set({ quantity: totalQuantity })
      .where(eq(cart_items.id, existingItem.id))
      .returning()
      .execute();
    return updated[0];
  } else {
    if (product.stock !== null && quantity > product.stock) {
      throw new Error(`Cannot add ${quantity} items. Only ${product.stock} in stock.`);
    }
    const insertedItem = await db
      .insert(cart_items)
      .values({ cart_id: cart.id, product_id: productId, quantity })
      .returning()
      .execute();
    return insertedItem[0];
  }
}



export async function removeFromCart(userId: string, productId: string) {
  const cartResult = await db.select().from(carts).where(eq(carts.user_id, userId)).execute();
  const cart = cartResult[0];
  if (!cart) throw new Error("Cart not found");

  const deleted = await db
    .delete(cart_items)
    .where(and(eq(cart_items.cart_id, cart.id), eq(cart_items.product_id, productId)))
    .returning()
    .execute();

  return deleted;
}

export async function clearCart(userId: string) {
  const cartResult = await db.select().from(carts).where(eq(carts.user_id, userId)).execute();
  const cart = cartResult[0];
  if (!cart) throw new Error("Cart not found");

  const deleted = await db.delete(cart_items).where(eq(cart_items.cart_id, cart.id)).returning().execute();
  return deleted;
}

export async function reduceCartItem(userId: string, productId: string, quantity: number) {
  if (quantity <= 0) throw new Error("Quantity to reduce must be greater than zero");

  // Get the user's cart
  const cartResult = await db.select().from(carts).where(eq(carts.user_id, userId)).execute();
  const cart = cartResult[0];
  if (!cart) throw new Error("Cart not found");

  // Get the cart item
  const itemResult = await db
    .select()
    .from(cart_items)
    .where(and(eq(cart_items.cart_id, cart.id), eq(cart_items.product_id, productId)))
    .execute();
  const item = itemResult[0];
  if (!item) throw new Error("Item not found in cart");

  // Calculate new quantity
  const newQuantity = item.quantity - quantity;

  if (newQuantity > 0) {
    // Update the quantity
    const updated = await db
      .update(cart_items)
      .set({ quantity: newQuantity })
      .where(eq(cart_items.id, item.id))
      .returning()
      .execute();
    return updated[0];
  } else {
    // Remove the item if quantity drops to zero or below
    const deleted = await db
      .delete(cart_items)
      .where(eq(cart_items.id, item.id))
      .returning()
      .execute();
    return deleted[0];
  }
}
