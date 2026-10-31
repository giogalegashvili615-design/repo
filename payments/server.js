// Minimal checkout service for the Assistant site.
//
// Creates a $4/month subscription Checkout Session. Stripe Checkout offers
// Google Pay (and Apple Pay) automatically on devices/browsers that support a
// wallet, once the Stripe account has wallets enabled in the dashboard.
//
// Without STRIPE_SECRET_KEY the endpoint answers 503 { error: "not_configured" }
// so the site can tell the visitor instead of failing silently.
import express from "express";
import Stripe from "stripe";

const app = express();
app.disable("x-powered-by");

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const PORT = Number(process.env.PORT || 8000);
const PUBLIC_ORIGIN = process.env.BASE44_PUBLIC_HOST_SUFFIX
  ? `https://3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`
  : "http://localhost:3000";

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, checkout: Boolean(stripe) });
});

app.post("/api/checkout", async (_req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: "not_configured" });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 400,
            recurring: { interval: "month" },
            product_data: { name: "Assistant — monthly" },
          },
        },
      ],
      success_url: `${PUBLIC_ORIGIN}/?subscribed=1#pricing`,
      cancel_url: `${PUBLIC_ORIGIN}/#pricing`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("checkout session failed:", err.message);
    res.status(502).json({ error: "checkout_failed" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `payments listening on :${PORT} (stripe ${stripe ? "configured" : "NOT configured"})`
  );
});
