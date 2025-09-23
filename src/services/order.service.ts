import { db } from "../config/db.js";
import { carts, cart_items } from "../models/cart.model.js";
import { orders } from "../models/orders.model.js";
import { orderItems } from "../models/orderItems.model.js";
import { products } from "../models/products.model.js";
import { eq, and } from "drizzle-orm";

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
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shipping: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    method: "standard" | "express" | "overnight";
    cost: string;
  };
  items: {
    id: string;
    product_id: string;
    quantity: number;
    price: string;
  }[];
};


export type OrderDetails = {
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  shipping: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shippingMethod: "standard" | "express" | "overnight";
  shippingCost: number;
};

export async function placeOrder(userId: string, orderDetails: {
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shipping: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shippingMethod: "standard" | "express" | "overnight";
  shippingCost: number;
}) : Promise<OrderResult> {
  return db.transaction(async (tx) => {
    const cartResult = await tx.select().from(carts).where(eq(carts.user_id, userId)).execute();
    const cart = cartResult[0];
    if (!cart) throw new Error("Cart is empty");

    const itemsResult = await tx
      .select()
      .from(cart_items)
      .leftJoin(products, eq(cart_items.product_id, products.id))
      .where(eq(cart_items.cart_id, cart.id))
      .execute();

    if (itemsResult.length === 0) throw new Error("Cart is empty");

    let totalAmount = 0;
    for (const row of itemsResult) {
      if (!row.products) throw new Error(`Product ${row.cart_items.product_id} not found`);
      const stock = row.products.stock ?? 0;
      if (row.cart_items.quantity > stock) {
        throw new Error(`Insufficient stock for ${row.products.name}`);
      }
      totalAmount += Number(row.products.price) * row.cart_items.quantity;
    }

    for (const row of itemsResult) {
      const stock = row.products!.stock ?? 0;
      await tx.update(products)
        .set({ stock: stock - row.cart_items.quantity })
        .where(eq(products.id, row.products!.id))
        .execute();
    }

    // INSERT order with new fields
    const insertedOrders = await tx
  .insert(orders)
  .values({
    user_id: userId,
    total_amount: totalAmount.toString(), // numeric as string
    status: "pending",
    first_name: orderDetails.contact.firstName,
    last_name: orderDetails.contact.lastName,
    email: orderDetails.contact.email,
    phone: orderDetails.contact.phone || "", // ensure not null
    street_address: orderDetails.shipping.address,
    city: orderDetails.shipping.city,
    state: orderDetails.shipping.state,
    zip: orderDetails.shipping.zip,
    country: orderDetails.shipping.country,
    shipping_method: orderDetails.shippingMethod,
    shipping_cost: orderDetails.shippingCost.toString(), // numeric as string
  })
  .returning()
  .execute();


    const order = insertedOrders[0];

    for (const row of itemsResult) {
      await tx.insert(orderItems).values({
        order_id: order.id,
        product_id: row.products!.id,
        quantity: row.cart_items.quantity,
        price: row.products!.price,
      }).execute();
    }

    await tx.delete(cart_items).where(eq(cart_items.cart_id, cart.id)).execute();

    return { order_id: order.id, total_amount: totalAmount.toString() };
  });
}



export async function buyNow(
  userId: string,
  productId: string,
  quantity: number,
  orderDetails: OrderDetails
): Promise<OrderResult> {
  return db.transaction(async (tx) => {
    // 1. Get product
    const productResult = await tx
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .execute();
    const product = productResult[0];
    if (!product) throw new Error("Product not found");
    if ((product.stock ?? 0) < quantity)
      throw new Error(`Insufficient stock for ${product.name}`);

    const totalAmount = Number(product.price) * quantity + orderDetails.shippingCost;

    // 2. Reduce stock
    await tx
      .update(products)
      .set({ stock: (product.stock ?? 0) - quantity })
      .where(eq(products.id, product.id))
      .execute();

    // 3. Insert order
    const insertedOrders = await tx
      .insert(orders)
      .values({
        user_id: userId,
        total_amount: totalAmount.toString(),
        status: "pending",
        first_name: orderDetails.contact.firstName,
        last_name: orderDetails.contact.lastName,
        email: orderDetails.contact.email,
        phone: orderDetails.contact.phone || "",
        street_address: orderDetails.shipping.address,
        city: orderDetails.shipping.city,
        state: orderDetails.shipping.state,
        zip: orderDetails.shipping.zip,
        country: orderDetails.shipping.country,
        shipping_method: orderDetails.shippingMethod,
        shipping_cost: orderDetails.shippingCost.toString(),
      })
      .returning()
      .execute();

    const order = insertedOrders[0];

    // 4. Insert order item
    await tx
      .insert(orderItems)
      .values({
        order_id: order.id,
        product_id: product.id,
        quantity,
        price: product.price,
      })
      .execute();

    return { order_id: order.id, total_amount: totalAmount.toString() };
  });
}

export async function getUserOrders(userId: string): Promise<UserOrder[]> {
  const ordersResult = await db
    .select()
    .from(orders)
    .where(eq(orders.user_id, userId))
    .execute();

  const result: UserOrder[] = [];
  for (const order of ordersResult) {
    const itemsResult = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.order_id, order.id))
      .execute();

    const items = itemsResult.map((item) => ({
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
      contact: {
        firstName: order.first_name,
        lastName: order.last_name,
        email: order.email,
        phone: order.phone || "",
      },
      shipping: {
        address: order.street_address,
        city: order.city,
        state: order.state,
        zip: order.zip,
        country: order.country,
        method: order.shipping_method as "standard" | "express" | "overnight",
        cost: order.shipping_cost,
      },
      items,
    });
  }

  return result;
}
export async function getOrderById(
  userId: string,
  orderId: string
): Promise<UserOrder | null> {
  const orderResult = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.user_id, userId)))
    .execute();

  const order = orderResult[0];
  if (!order) return null;

  const itemsResult = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.order_id, order.id))
    .execute();

  const items = itemsResult.map((item) => ({
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
    contact: {
      firstName: order.first_name,
      lastName: order.last_name,
      email: order.email,
      phone: order.phone || "",
    },
    shipping: {
      address: order.street_address,
      city: order.city,
      state: order.state,
      zip: order.zip,
      country: order.country,
      method: order.shipping_method as "standard" | "express" | "overnight",
      cost: order.shipping_cost,
    },
    items,
  };
}

export async function cancelOrder(userId: string, orderId: string): Promise<UserOrder> {
  return db.transaction(async tx => {
    // 1. Find the order
    const orderResult = await tx.select().from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.user_id, userId)))
      .execute();

    const order = orderResult[0];
    if (!order) throw new Error("Order not found");
    if (order.status === "cancelled") throw new Error("Order already cancelled");
    if (order.status === "completed") throw new Error("Cannot cancel completed order");

    // 2. Get order items
    const itemsResult = await tx.select().from(orderItems)
      .where(eq(orderItems.order_id, order.id))
      .execute();

    // 3. Restore stock
    for (const item of itemsResult) {
      const productResult = await tx.select().from(products)
        .where(eq(products.id, item.product_id))
        .execute();

      const product = productResult[0];
      if (!product) continue;

      await tx.update(products)
        .set({ stock: (product.stock ?? 0) + item.quantity })
        .where(eq(products.id, product.id))
        .execute();
    }

    const updatedOrders = await tx.update(orders)
      .set({ status: "cancelled" })
      .where(eq(orders.id, order.id))
      .returning()
      .execute();

    const updatedOrder = updatedOrders[0];

    const items = itemsResult.map(item => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    return {
  id: updatedOrder.id,
  total_amount: updatedOrder.total_amount,
  status: updatedOrder.status,
  created_at: updatedOrder.created_at!,
  updated_at: updatedOrder.updated_at!,
  contact: {
    firstName: updatedOrder.first_name,
    lastName: updatedOrder.last_name,
    email: updatedOrder.email,
    phone: updatedOrder.phone || "",
  },
  shipping: {
    address: updatedOrder.street_address,
    city: updatedOrder.city,
    state: updatedOrder.state,
    zip: updatedOrder.zip,
    country: updatedOrder.country,
    method: updatedOrder.shipping_method as "standard" | "express" | "overnight",
    cost: updatedOrder.shipping_cost,
  },
  items,
};

  });
}