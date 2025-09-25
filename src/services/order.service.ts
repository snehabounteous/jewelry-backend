import { db } from "../config/db.js";
import { carts, cart_items } from "../models/cart.model.js";
import { orders } from "../models/orders.model.js";
import { orderItems } from "../models/orderItems.model.js";
import { products } from "../models/products.model.js";
import { eq, and } from "drizzle-orm";
import { addresses } from "../models/address.model.js";


export type PlaceOrderPayload = {
  userId: string;
  options: {
    addressId?: string;
    contact?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    shipping?: {
      address: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    shippingMethod: string;
    shippingCost: number;
  };
};

export type OrderResult = {
  order_id: string;
  total_amount: string;
};

export type UserOrder = {
  id: string;
  total_amount: string;
  status: string | null;
  created_at: Date;
  updated_at: Date;
  items: {
    id: string;
    product_id: string;
    quantity: number;
    price: string;
  }[];
};

export async function placeOrder(payload: PlaceOrderPayload) {
  const { userId, options } = payload;

  return db.transaction(async (tx) => {
    // 1️⃣ Get user's cart
    const cartResult = await tx
      .select()
      .from(carts)
      .where(eq(carts.user_id, userId))
      .execute();
    const cart = cartResult[0];
    if (!cart) throw new Error("Cart is empty");

    // 2️⃣ Get cart items
    const itemsResult = await tx
      .select()
      .from(cart_items)
      .leftJoin(products, eq(cart_items.product_id, products.id))
      .where(eq(cart_items.cart_id, cart.id))
      .execute();

    if (itemsResult.length === 0) throw new Error("Cart is empty");

    // 3️⃣ Calculate total & check stock
    let totalAmount = 0;
    for (const row of itemsResult) {
      if (!row.products)
        throw new Error(`Product ${row.cart_items.product_id} not found`);
      const stock = row.products.stock ?? 0;
      if (row.cart_items.quantity > stock)
        throw new Error(`Insufficient stock for ${row.products.name}`);
      totalAmount += Number(row.products.price) * row.cart_items.quantity;
    }

    // Add shipping cost
    totalAmount += options.shippingCost;

    // 4️⃣ Deduct stock
    for (const row of itemsResult) {
      const stock = row.products!.stock ?? 0;
      await tx
        .update(products)
        .set({ stock: stock - row.cart_items.quantity })
        .where(eq(products.id, row.products!.id))
        .execute();
    }

    // 5️⃣ Determine address
    let address;
    if (options.addressId) {
      // Existing address
      const addressResult = await tx
        .select()
        .from(addresses)
        .where(eq(addresses.id, options.addressId))
        .execute();
      address = addressResult[0];
      if (!address) throw new Error("Address not found");
    } else if (options.contact && options.shipping) {
      // New address
      const inserted = await tx
        .insert(addresses)
        .values({
          user_id: userId,
          first_name: options.contact.firstName,
          last_name: options.contact.lastName,
          email: options.contact.email,
          phone: options.contact.phone,
          street_address: options.shipping.address,
          city: options.shipping.city,
          state: options.shipping.state,
          zip: options.shipping.zip,
          country: options.shipping.country,
          is_default: false,
        })
        .returning()
        .execute();
      address = inserted[0];
    } else {
      throw new Error("No shipping information provided");
    }

    // 6️⃣ Insert order with snapshot
    const [order] = await tx
      .insert(orders)
      .values({
        user_id: userId,
        address_id: address.id,
        total_amount: totalAmount.toString(),
        status: "pending",

        first_name: address.first_name,
        last_name: address.last_name,
        email: address.email,
        phone: address.phone,
        street_address: address.street_address,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,

        shipping_method: options.shippingMethod,
        shipping_cost: options.shippingCost.toString(),
      })
      .returning()
      .execute();

    // 7️⃣ Insert order items
    for (const row of itemsResult) {
      await tx
        .insert(orderItems)
        .values({
          order_id: order.id,
          product_id: row.products!.id,
          quantity: row.cart_items.quantity,
          price: row.products!.price,
        })
        .execute();
    }

    // 8️⃣ Clear cart
    await tx
      .delete(cart_items)
      .where(eq(cart_items.cart_id, cart.id))
      .execute();

    return { order_id: order.id, total_amount: totalAmount.toString() };
  });
}

export async function buyNow(
  userId: string,
  productId: string,
  quantity: number,
  options: PlaceOrderPayload["options"]
): Promise<OrderResult> {
  return db.transaction(async (tx) => {
    // 1️⃣ Get product
    const productResult = await tx.select().from(products).where(eq(products.id, productId)).execute();
    const product = productResult[0];
    if (!product) throw new Error("Product not found");
    if ((product.stock ?? 0) < quantity) throw new Error(`Insufficient stock for ${product.name}`);

    const totalAmount = Number(product.price) * quantity + options.shippingCost;

    // 2️⃣ Deduct stock
    await tx.update(products).set({ stock: (product.stock ?? 0) - quantity }).where(eq(products.id, product.id)).execute();

    // 3️⃣ Determine address
    let address;
    if (options.addressId) {
      const addr = await tx.select().from(addresses).where(eq(addresses.id, options.addressId)).execute();
      address = addr[0];
      if (!address) throw new Error("Address not found");
    } else if (options.contact && options.shipping) {
      const inserted = await tx
        .insert(addresses)
        .values({
          user_id: userId,
          first_name: options.contact.firstName,
          last_name: options.contact.lastName,
          email: options.contact.email,
          phone: options.contact.phone,
          street_address: options.shipping.address,
          city: options.shipping.city,
          state: options.shipping.state,
          zip: options.shipping.zip,
          country: options.shipping.country,
          is_default: false,
        })
        .returning()
        .execute();
      address = inserted[0];
    } else {
      throw new Error("No shipping information provided");
    }

    // 4️⃣ Insert order
    const [order] = await tx.insert(orders).values({
      user_id: userId,
      address_id: address.id,
      total_amount: totalAmount.toString(),
      status: "pending",
      first_name: address.first_name,
      last_name: address.last_name,
      email: address.email,
      phone: address.phone,
      street_address: address.street_address,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      shipping_method: options.shippingMethod,
      shipping_cost: options.shippingCost.toString(),
    }).returning().execute();

    // 5️⃣ Insert order item
    await tx.insert(orderItems).values({
      order_id: order.id,
      product_id: product.id,
      quantity,
      price: product.price,
    }).execute();

    return { order_id: order.id, total_amount: totalAmount.toString() };
  });
}


export async function getUserOrders(userId: string): Promise<UserOrder[]> {
  const ordersResult = await db.select().from(orders).where(eq(orders.user_id, userId)).execute();
  const result: UserOrder[] = [];

  for (const order of ordersResult) {
    const itemsResult = await db.select().from(orderItems).where(eq(orderItems.order_id, order.id)).execute();
    const items = itemsResult.map(item => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));
    result.push({
      id: order.id,
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at!,
      updated_at: order.updated_at!,
      items,
    });
  }
  return result;
}

export async function getOrderById(userId: string, orderId: string): Promise<UserOrder | null> {
  const orderResult = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.user_id, userId))).execute();
  const order = orderResult[0];
  if (!order) return null;

  const itemsResult = await db.select().from(orderItems).where(eq(orderItems.order_id, order.id)).execute();
  const items = itemsResult.map(item => ({
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));

  return {
    id: order.id,
    total_amount: order.total_amount,
    status: order.status,
    created_at: order.created_at!,
    updated_at: order.updated_at!,
    items,
  };
}

export async function cancelOrder(userId: string, orderId: string): Promise<UserOrder> {
  return db.transaction(async (tx) => {
    const orderResult = await tx.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.user_id, userId))).execute();
    const order = orderResult[0];
    if (!order) throw new Error("Order not found");
    if (order.status === "cancelled") throw new Error("Order already cancelled");
    if (order.status === "completed") throw new Error("Cannot cancel completed order");

    // Restore stock
    const itemsResult = await tx.select().from(orderItems).where(eq(orderItems.order_id, order.id)).execute();
    for (const item of itemsResult) {
      const productResult = await tx.select().from(products).where(eq(products.id, item.product_id)).execute();
      const product = productResult[0];
      if (!product) continue;
      await tx.update(products).set({ stock: (product.stock ?? 0) + item.quantity }).where(eq(products.id, product.id)).execute();
    }

    // Update order status
    const updatedOrders = await tx.update(orders).set({ status: "cancelled" }).where(eq(orders.id, order.id)).returning().execute();
    const updatedOrder = updatedOrders[0];

    return {
      id: updatedOrder.id,
      total_amount: updatedOrder.total_amount,
      status: updatedOrder.status,
      created_at: updatedOrder.created_at!,
      updated_at: updatedOrder.updated_at!,
      items: itemsResult.map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })),
    };
  });
}