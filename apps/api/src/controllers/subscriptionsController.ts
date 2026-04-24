import { Request, Response } from "express";
import type { CreateSubscriptionInput } from "@vex/shared";
import { requireAuth } from "../middleware/auth.js";
import Stripe from "stripe";
import { prisma } from "../lib/tenant.js";
import { resolveBrowserOrPublicWebOrigin } from "../lib/publicOrigins.js";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function getPriceId(plan: string, billingInterval: string): string | null {
  const interval = billingInterval === "yearly" ? "YEARLY" : "MONTHLY";
  if (plan === "CHECK_MY_DEAL") return process.env[`STRIPE_PRICE_CHECK_MY_DEAL_${interval}`] ?? null;
  if (plan === "VIP_CONCIERGE") return process.env[`STRIPE_PRICE_VIP_CONCIERGE_${interval}`] ?? null;
  return null;
}

export async function create(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });

  const body = req.body as CreateSubscriptionInput;
  const expiresAt = new Date();
  if (body.billingInterval === "yearly") {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  const sub = await prisma.subscription.create({
    data: {
      tenant: { connect: { id: req.tenantId! } },
      user: { connect: { id: user.userId } },
      plan: body.plan,
      status: "ACTIVE",
      billingInterval: body.billingInterval ?? "monthly",
      amount: body.amount ?? (body.plan === "CHECK_MY_DEAL" ? 99 : 499),
      expiresAt,
    },
  });

  return res.status(201).json({
    id: sub.id,
    plan: sub.plan,
    status: sub.status,
    billingInterval: sub.billingInterval,
    amount: sub.amount != null ? Number(sub.amount) : null,
    expiresAt: sub.expiresAt,
    createdAt: sub.createdAt,
  });
}

export async function createStripeCheckoutSession(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });

  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ code: "NOT_CONFIGURED", message: "STRIPE_SECRET_KEY is not set" });
  }

  const body = req.body as CreateSubscriptionInput;
  const billingInterval = body.billingInterval === "yearly" ? "yearly" : "monthly";
  const priceId = getPriceId(body.plan, billingInterval);
  if (!priceId) {
    return res.status(503).json({
      code: "NOT_CONFIGURED",
      message: `Missing Stripe price env for ${body.plan} (${billingInterval})`,
    });
  }

  let origin: string;
  try {
    origin = resolveBrowserOrPublicWebOrigin(
      typeof req.headers.origin === "string" ? req.headers.origin : null
    );
  } catch (error) {
    return res.status(503).json({
      code: "NOT_CONFIGURED",
      message: error instanceof Error ? error.message : "PUBLIC_WEB_URL must be configured in production.",
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/portal/subscriptions?stripe=success`,
    cancel_url: `${origin}/pricing?stripe=cancel`,
    metadata: {
      tenantId: user.tenantId,
      userId: user.userId,
      planId: body.plan,
      plan: body.plan,
      billingInterval,
    },
  });

  await prisma.subscription.create({
    data: {
      tenant: { connect: { id: req.tenantId! } },
      user: { connect: { id: user.userId } },
      plan: body.plan,
      status: "PENDING",
      billingInterval,
      stripeCheckoutSessionId: session.id,
    },
  });

  return res.status(201).json({ id: session.id, url: session.url });
}

export async function listMine(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });

  const subs = await prisma.subscription.findMany({
    where: { userId: user.userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  return res.json(
    subs.map((s) => ({
      id: s.id,
      plan: s.plan,
      status: s.status,
      billingInterval: s.billingInterval,
      amount: s.amount != null ? Number(s.amount) : null,
      expiresAt: s.expiresAt,
      createdAt: s.createdAt,
    }))
  );
}
