import { NextResponse } from "next/server";
import Stripe from "stripe";

const SECRET = process.env.STRIPE_SECRET_KEY || "sk_test_51SIw5kPOZfUFLsPOppuX3fk7h9PgRgRcxx5lohXbcAWG1UbTc8GnAhrL9Pyrf1s7QkY7EbzS1vGIFlgz6lNQ5JWG004FQAfolg"; // Test edebilmeniz için buraya eklendi normalde .env dosyasında olmalı.
const stripe = new Stripe(SECRET, { apiVersion: "2024-06-20" });

export async function POST(req) {
  try {
    const body = await req.json();
    const amount = Math.max(1, Math.floor(Number(body.amount || 0) * 100)); 
    const currency = (body.currency || "try").toLowerCase();
    const paymentIntent = await stripe.paymentIntents.create({ amount, currency, automatic_payment_methods: { enabled: true }, metadata: body.metadata || {} });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    return NextResponse.json({ error: "payment_intent_failed" }, { status: 400 });
  }
}


