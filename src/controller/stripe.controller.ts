import { Request, Response } from "express";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20" as any,
});

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
}

export const createPaymentIntent = async (
    
  req: Request<{}, {}, CreatePaymentIntentRequest>,
  res: Response
) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: "Amount and currency are required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message });
  }
};
