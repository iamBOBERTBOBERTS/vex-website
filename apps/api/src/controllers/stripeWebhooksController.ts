import { Request, Response } from "express";
import Stripe from "stripe";
import type { Stripe as StripeTypes } from "stripe";
import { systemPrisma, prisma, runWithTenant } from "../lib/tenant.js";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function addInterval(from: Date, interval: "monthly" | "yearly"): Date {
  const d = new Date(from);
  if (interval === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

export async function stripe(req: Request, res: Response) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return res.status(503).json({
      code: "NOT_CONFIGURED",
      message: "Stripe is not configured (missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET)",
    });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    return res.status(400).json({ code: "BAD_REQUEST", message: "Missing stripe-signature header" });
  }

  let event: StripeTypes.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({
      code: "BAD_REQUEST",
      message: err instanceof Error ? err.message : "Invalid signature",
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as StripeTypes.Checkout.Session;
        const userId = typeof session.metadata?.userId === "string" ? session.metadata.userId : null;
        const plan = typeof session.metadata?.plan === "string" ? session.metadata.plan : null;
        const billingInterval = session.metadata?.billingInterval === "yearly" ? "yearly" : "monthly";

        if (userId && plan) {
          const user = await systemPrisma.user.findUnique({ where: { id: userId } });
          if (!user) break;

          const amount = typeof session.amount_total === "number" ? session.amount_total / 100 : null;
          const expiresAt = addInterval(new Date(), billingInterval);
          const stripeCheckoutSessionId = typeof session.id === "string" ? session.id : null;
          const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;
          const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : null;

          if (stripeCheckoutSessionId) {
            await runWithTenant(user.tenantId, async () => {
              const existing = await prisma.subscription.findFirst({
                where: { stripeCheckoutSessionId },
              });
              if (existing) {
                await prisma.subscription.updateMany({
                  where: { stripeCheckoutSessionId },
                  data: {
                    status: "ACTIVE",
                    billingInterval,
                    amount: amount ?? undefined,
                    expiresAt,
                    stripeCustomerId: stripeCustomerId ?? undefined,
                    stripeSubscriptionId: stripeSubscriptionId ?? undefined,
                  },
                });
              } else {
                await prisma.subscription.create({
                  data: {
                    tenant: { connect: { id: user.tenantId } },
                    user: { connect: { id: userId } },
                    plan: plan as "CHECK_MY_DEAL" | "VIP_CONCIERGE",
                    status: "ACTIVE",
                    billingInterval,
                    amount: amount ?? undefined,
                    expiresAt,
                    stripeCheckoutSessionId,
                    stripeCustomerId: stripeCustomerId ?? undefined,
                    stripeSubscriptionId: stripeSubscriptionId ?? undefined,
                  },
                });
              }
              await prisma.usageLog.create({
                data: {
                  tenantId: user.tenantId,
                  kind: "subscription_payment",
                  quantity: 1,
                  amountUsd: amount ?? undefined,
                  meta: {
                    stripeCheckoutSessionId,
                    stripeSubscriptionId: stripeSubscriptionId ?? null,
                    billingInterval,
                    plan,
                  },
                },
              });
            });
          }
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as StripeTypes.Subscription;
        const stripeSubscriptionId = sub.id;
        const status = event.type === "customer.subscription.deleted" ? "CANCELED" : String(sub.status ?? "ACTIVE").toUpperCase();
        const periodEnds = (sub.items?.data ?? [])
          .map((i) => (typeof i.current_period_end === "number" ? i.current_period_end : null))
          .filter((x): x is number => typeof x === "number");
        const minPeriodEnd = periodEnds.length > 0 ? Math.min(...periodEnds) : null;
        const expiresAt = typeof minPeriodEnd === "number" ? new Date(minPeriodEnd * 1000) : null;

        const existing = await systemPrisma.subscription.findFirst({
          where: { stripeSubscriptionId },
          select: { tenantId: true },
        });
        if (!existing) break;
        await runWithTenant(existing.tenantId, async () => {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId },
            data: {
              status,
              expiresAt: expiresAt ?? undefined,
              stripeCustomerId: typeof sub.customer === "string" ? sub.customer : undefined,
            },
          });
        });
        break;
      }
      default:
        break;
    }

    return res.json({ received: true });
  } catch (err) {
    return res.status(500).json({
      code: "INTERNAL",
      message: err instanceof Error ? err.message : "Webhook handler failed",
    });
  }
}

