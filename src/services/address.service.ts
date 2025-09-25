import { db } from "../config/db.js";
import { addresses } from "../models/address.model.js";
import { eq, and } from "drizzle-orm";

export type AddressInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default?: boolean;
};

export async function getAddresses(userId: string) {
  return db.select().from(addresses).where(eq(addresses.user_id, userId)).execute();
}

export async function getDefaultAddress(userId: string) {
  const result = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.user_id, userId), eq(addresses.is_default, true)))
    .limit(1)
    .execute();

  if (result[0]) return result[0];

  const allAddresses = await getAddresses(userId);
  return allAddresses[0] || null;
}


export async function addAddress(userId: string, data: AddressInput) {
  if (data.is_default) {
    await db.update(addresses).set({ is_default: false }).where(eq(addresses.user_id, userId)).execute();
  }

  const inserted = await db.insert(addresses).values({
    user_id: userId,
    ...data,
    is_default: data.is_default || false,
  }).returning().execute();

  return inserted[0];
}

export async function updateAddress(userId: string, addressId: string, data: AddressInput) {
  if (data.is_default) {
    await db.update(addresses).set({ is_default: false }).where(eq(addresses.user_id, userId)).execute();
  }

  const updated = await db
  .update(addresses)
  .set({
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    street_address: data.street_address,
    city: data.city,
    state: data.state,
    zip: data.zip,
    country: data.country,
    is_default: data.is_default ?? false,
  })
  .where(eq(addresses.id, addressId))
  .returning()
  .execute();

  return updated[0];
}

export async function deleteAddress(userId: string, addressId: string) {
  const deleted = await db.delete(addresses)
    .where(and(eq(addresses.id, addressId), eq(addresses.user_id, userId)))
    .returning()
    .execute();
  return deleted[0];
}
