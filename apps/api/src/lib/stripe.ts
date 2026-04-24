import Stripe from "stripe";
import { getPublicWebOrigin } from "./publicOrigins.js";

export type StripePlanId = "STARTER" | "PRO" | "ENTERPRISE";

export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is required");
  return new Stripe(key);
}

function priceIdForPlan(planId: StripePlanId): string {
  const key =
    planId === "STARTER"
      ? "STRIPE_PRICE_STARTER"
      : planId === "PRO"
        ? "STRIPE_PRICE_PRO"
        : "STRIPE_PRICE_ENTERPRISE";
  const priceId = process.env[key];
  if (!priceId) throw new Error(`${key} is not set`);
  return priceId;
}

export async function createCheckoutSession(
  planId: StripePlanId,
  tenantId: string,
  interval: "monthly" | "yearly" = "monthly",
  urls?: { successPath: string; cancelPath: string }
) {
  const stripe = getStripeClient();
  const origin = getPublicWebOrigin();
  const successPath = urls?.successPath ?? "/portal/subscriptions?stripe=success";
  const cancelPath = urls?.cancelPath ?? "/pricing?stripe=cancel";
  const priceEnv =
    planId === "STARTER"
      ? interval === "yearly"
        ? process.env.STRIPE_PRICE_STARTER_YEARLY
        : process.env.STRIPE_PRICE_STARTER
      : planId === "PRO"
        ? interval === "yearly"
          ? process.env.STRIPE_PRICE_PRO_YEARLY
          : process.env.STRIPE_PRICE_PRO
        : interval === "yearly"
          ? process.env.STRIPE_PRICE_ENTERPRISE_YEARLY
          : process.env.STRIPE_PRICE_ENTERPRISE;
  const priceId = priceEnv || priceIdForPlan(planId);

  const base = origin.replace(/\/$/, "");
  const abs = (p: string) => (p.startsWith("/") ? `${base}${p}` : `${base}/${p}`);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: abs(successPath),
    cancel_url: abs(cancelPath),
    metadata: { tenantId, planId, interval },
  });

  return session;
}

