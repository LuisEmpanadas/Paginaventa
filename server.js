import express from "express";
import stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(express.json());

// Sirve todos los archivos estáticos (HTML, CSS, JS, imágenes, favicon, etc.)
app.use(express.static(__dirname));

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "store.html"));
});

// Ruta para crear la sesión de pago con Stripe
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error en Stripe:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log("Directorio actual:", __dirname);
});
