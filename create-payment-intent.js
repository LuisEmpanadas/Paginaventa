// netlify/functions/create-payment-intent.js
// Esta función corre en el servidor de Netlify — la Secret Key nunca llega al frontend.

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  // Solo aceptar POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { priceId } = JSON.parse(event.body || "{}");

    // Obtener el precio desde Stripe usando el Price ID
    const price = await stripe.prices.retrieve(
      priceId || process.env.STRIPE_PRICE_ID
    );

    // Crear el PaymentIntent con el monto del precio
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   price.unit_amount,
      currency: price.currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        price_id: price.id,
        product:  "SURCO — Vinilo",
      },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };

  } catch (err) {
    console.error("Stripe error:", err.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
