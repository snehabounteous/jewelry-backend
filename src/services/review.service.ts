import { db } from "../config/db.js";
import { reviews } from "../models/review.model.js";
import { orders } from "../models/orders.model.js";
import { orderItems } from "../models/orderItems.model.js";
import { eq, and } from "drizzle-orm";

export type Review = {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
};

export async function addOrUpdateReview(
  user_id: string,
  product_id: string,
  rating: number,
  comment?: string
): Promise<Review> {
  if (rating < 1 || rating > 5)
    throw new Error("Rating must be between 1 and 5"); // Check if the user has purchased this product

  const purchased = await db
    .select()
    .from(orderItems)
    .leftJoin(orders, eq(orderItems.order_id, orders.id))
    .where(
      and(eq(orderItems.product_id, product_id), eq(orders.user_id, user_id))
    )
    .limit(1) // Add this to optimize the query
    .execute();

  if (purchased.length === 0) {
    throw new Error("User cannot review a product they haven't purchased");
  } // Upsert review safely using the unique index

  const inserted = await db
    .insert(reviews)
    .values({
      user_id,
      product_id,
      rating,
      comment: comment ?? null,
    })
    .onConflictDoUpdate({
      target: [reviews.user_id, reviews.product_id],
      set: {
        rating,
        comment: comment ?? null,
        updated_at: new Date(),
      },
    })
    .returning()
    .execute();

  const row = inserted[0];
  return {
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    rating: row.rating,
    comment: row.comment,
    created_at: row.created_at ?? new Date(),
    updated_at: row.updated_at ?? new Date(),
  };
}

// Get all reviews for a product
export async function getProductReviews(product_id: string): Promise<Review[]> {
  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.product_id, product_id))
    .execute();

  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    rating: row.rating,
    comment: row.comment,
    created_at: row.created_at ?? new Date(),
    updated_at: row.updated_at ?? new Date(),
  }));
}

// Get a user's review for a product
export async function getUserReview(
  user_id: string,
  product_id: string
): Promise<Review | null> {
  const rows = await db
    .select()
    .from(reviews)
    .where(
      and(eq(reviews.user_id, user_id), eq(reviews.product_id, product_id))
    )
    .execute();

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    rating: row.rating,
    comment: row.comment,
    created_at: row.created_at ?? new Date(),
    updated_at: row.updated_at ?? new Date(),
  };
}

// Delete a review
export async function deleteReview(
  user_id: string,
  product_id: string
): Promise<Review | null> {
  const deleted = await db
    .delete(reviews)
    .where(
      and(eq(reviews.user_id, user_id), eq(reviews.product_id, product_id))
    )
    .returning()
    .execute();

  if (deleted.length === 0) return null;

  const row = deleted[0];
  return {
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    rating: row.rating,
    comment: row.comment,
    created_at: row.created_at ?? new Date(),
    updated_at: row.updated_at ?? new Date(),
  };
}
