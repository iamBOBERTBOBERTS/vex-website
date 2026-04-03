import express, { Router } from "express";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { stripeCheckoutSchema, type StripeCheckoutInput } from "@vex/shared";
import { createCheckoutSession, getStripeClient, type StripePlanId } from "../lib/stripe.js";
import { systemPrisma, withTenantScope, prisma as tenantPrisma } from "../lib/tenant.js";
import { sendLifecycleNotification } from "../lib/notify.js";
import { enqueueProvisionTenant } from "../lib/queue.js";

export const stripeRouter: Router = Router();

function isCheckoutSessionCompleteStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s === "complete" || s === "completed";
}

function toSubscriptionPlan(
  planId: string | null,
  legacyPlan: string | null
): "CHECK_MY_DEAL" | "VIP_CONCIERGE" {
  const raw = (planId ?? legacyPlan ?? "").toUpperCase();
  if (raw === "CHECK_MY_DEAL" || raw === "STARTER") return "CHECK_MY_DEAL";
  if (raw === "VIP_CONCIERGE" || raw === "PRO" || raw === "ENTERPRISE") return "VIP_CONCIERGE";
  return "VIP_CONCIERGE";
}

stripeRouter.post("/checkout", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), validateBody(stripeCheckoutSchema), async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  const tenantId = req.tenantId ?? user.tenantId;

  const body = req.body as StripeCheckoutInput;
  const session = await createCheckoutSession(body.planId as StripePlanId, tenantId, body.interval ?? "monthly");

  await withTenantScope(tenantId, async () =>
    tenantPrisma.checkoutSession.create({
    data: {
      tenantId,
      stripeCheckoutSessionId: session.id,
      mode: "subscription",
      status: String(session.status ?? "created"),
    },
    })
  );

  return res.status(201).json({ data: { url: session.url, id: session.id }, error: null });
});

stripeRouter.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(503).json({ code: "NOT_CONFIGURED", message: "STRIPE_WEBHOOK_SECRET is not set" });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    return res.status(400).json({ code: "BAD_REQUEST", message: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({
      code: "BAD_REQUEST",
      message: err instanceof Error ? err.message : "Invalid signature",
    });
  }

  const alreadyHandled = await systemPrisma.stripeWebhookEvent.findUnique({
    where: { id: event.id },
    select: { id: true },
  });
  if (alreadyHandled) {
    return res.json({ received: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = typeof session.metadata?.tenantId === "string" ? session.metadata.tenantId : null;
      const planId = typeof session.metadata?.planId === "string" ? session.metadata.planId : null;
      const legacyPlan = typeof session.metadata?.plan === "string" ? session.metadata.plan : null;
      const subscriptionPlan = toSubscriptionPlan(planId, legacyPlan);

      if (tenantId) {
        const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;
        const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : null;

        await withTenantScope(tenantId, async () => {
        const sessionId = typeof session.id === "string" ? session.id : null;
        let checkoutWasAlreadyCompleted = false;
        if (sessionId) {
          const priorCheckout = await tenantPrisma.checkoutSession.findFirst({
            where: { stripeCheckoutSessionId: sessionId },
            select: { status: true },
          });
          checkoutWasAlreadyCompleted =
            priorCheckout != null && isCheckoutSessionCompleteStatus(String(priorCheckout.status));
        }

        if (stripeCustomerId || stripeSubscriptionId) {
          await tenantPrisma.tenant.updateMany({
            where: { id: tenantId },
            data: {
              ...(planId ? { billingTier: planId } : {}),
              stripeSubscriptionStatus: "ACTIVE",
              ...(stripeCustomerId ? { stripeCustomerId } : {}),
              ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
            },
          });
        }

        if (typeof session.id === "string") {
          const existing = await tenantPrisma.checkoutSession.findFirst({
            where: { stripeCheckoutSessionId: session.id },
          });
          if (existing) {
            await tenantPrisma.checkoutSession.updateMany({
              where: { stripeCheckoutSessionId: session.id },
              data: { status: String(session.status ?? "completed") },
            });
          } else {
            await tenantPrisma.checkoutSession.create({
              data: {
                tenant: { connect: { id: tenantId } },
                stripeCheckoutSessionId: session.id,
                mode: "subscription",
                status: String(session.status ?? "completed"),
              },
            });
          }
        }

        if (stripeSubscriptionId) {
          const existingSub = await tenantPrisma.subscription.findFirst({
            where: { stripeSubscriptionId },
          });
          if (!existingSub) {
            await tenantPrisma.subscription.create({
              data: {
                tenant: { connect: { id: tenantId } },
                user: {
                  connect: {
                    id: (
                      await tenantPrisma.user.findFirst({
                        where: { tenantId },
                        select: { id: true },
                      })
                    )!.id,
                  },
                },
                plan: subscriptionPlan,
                status: "ACTIVE",
                billingInterval: "monthly",
                stripeSubscriptionId,
                stripeCustomerId: stripeCustomerId ?? undefined,
                stripeCheckoutSessionId: typeof session.id === "string" ? session.id : undefined,
              },
            });
          } else {
            await tenantPrisma.subscription.updateMany({
              where: { stripeSubscriptionId },
              data: {
                status: "ACTIVE",
                stripeCustomerId: stripeCustomerId ?? undefined,
              },
            });
          }
        }

        const owner = await tenantPrisma.user.findFirst({ where: { tenantId }, select: { email: true, phone: true } });
        if (owner?.email) {
          void sendLifecycleNotification({
            type: "PAYMENT_EVENT",
            toEmail: owner.email,
            smsTo: owner.phone ?? undefined,
            subject: "Subscription activated",
            message: "Your Stripe checkout completed successfully. Billing is active.",
          });
          void enqueueProvisionTenant({
            tenantId,
            tier: planId ?? "STARTER",
            email: owner.email,
          });
        }

        const sessionLooksComplete = isCheckoutSessionCompleteStatus(String(session.status ?? ""));
        if (sessionLooksComplete && sessionId && !checkoutWasAlreadyCompleted) {
          const amountUsd = typeof session.amount_total === "number" ? session.amount_total / 100 : null;
          await tenantPrisma.usageLog.create({
            data: {
              tenantId,
              kind: "saas_checkout",
              quantity: 1,
              amountUsd: amountUsd ?? undefined,
              meta: {
                planId: planId ?? null,
                stripeSubscriptionId: stripeSubscriptionId ?? null,
                stripeCheckoutSessionId: sessionId,
              },
            },
          });
        }
        });
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const stripeSubscriptionId = sub.id;
      const status = String(sub.status ?? "active").toUpperCase();
      const tenant = await systemPrisma.tenant.findFirst({
        where: { stripeSubscriptionId },
        select: { id: true },
      });
      if (tenant) {
        await withTenantScope(tenant.id, async () =>
          tenantPrisma.tenant.updateMany({
            where: { id: tenant.id, stripeSubscriptionId },
            data: { stripeSubscriptionStatus: status },
          })
        );
      }
    }

    try {
      await systemPrisma.stripeWebhookEvent.create({
        data: { id: event.id, type: event.type },
      });
    } catch (insertErr) {
      if (
        insertErr instanceof Prisma.PrismaClientKnownRequestError &&
        insertErr.code === "P2002"
      ) {
        return res.json({ received: true });
      }
      throw insertErr;
    }

    return res.json({ received: true });
  } catch (err) {
    return res.status(500).json({
      code: "INTERNAL",
      message: err instanceof Error ? err.message : "Webhook handler failed",
    });
  }
});

