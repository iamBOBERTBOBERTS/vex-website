import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAnyAuthenticatedRole, requireRole } from "../middleware/requireRole.js";
import { createPortalSessionSchema } from "@vex/shared";
import { getStripeClient } from "../lib/stripe.js";
import { prisma } from "../lib/tenant.js";
import { getPublicWebOrigin } from "../lib/publicOrigins.js";

export const pricingRouter: Router = Router();

const PLANS = [
  { tier: "STARTER", name: "Starter", monthly: 49, yearly: 470, features: ["1 user", "Basic CRM", "Inventory core"] },
  { tier: "PRO", name: "Pro", monthly: 149, yearly: 1430, features: ["5 users", "Portal + analytics", "Priority support"] },
  { tier: "ENTERPRISE", name: "Enterprise", monthly: 299, yearly: 2870, features: ["Unlimited users", "Custom integrations", "Dedicated support"] },
] as const;

pricingRouter.get("/plans", async (_req, res) => {
  return res.json({ data: { plans: PLANS }, error: null });
});

pricingRouter.get("/current", requireAuth, requireAnyAuthenticatedRole(), async (req, res) => {
  if (!req.user || !req.tenantId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  const tenant = await prisma.tenant.findFirst({
    where: { id: req.tenantId },
    select: {
      id: true,
      name: true,
      billingTier: true,
      stripeSubscriptionStatus: true,
      customDomain: true,
      themeJson: true,
      onboardedAt: true,
    },
  });
  if (!tenant) return res.status(404).json({ code: "NOT_FOUND", message: "Tenant not found" });
  return res.json({ data: tenant, error: null });
});

pricingRouter.post(
  "/portal/session",
  requireAuth,
  requireRole("ADMIN", "GROUP_ADMIN"),
  validateBody(createPortalSessionSchema),
  async (req, res) => {
    if (!req.user || !req.tenantId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });

    const tenant = await prisma.tenant.findFirst({
      where: { id: req.tenantId },
      select: { stripeCustomerId: true },
    });
    if (!tenant?.stripeCustomerId) {
      return res.status(400).json({
        code: "MISSING_STRIPE_CUSTOMER",
        message: "No Stripe customer linked to this tenant yet.",
      });
    }

    const body = req.body as { returnUrl?: string };
    const stripe = getStripeClient();
    let returnUrl = body.returnUrl;
    if (!returnUrl) {
      try {
        returnUrl = `${getPublicWebOrigin()}/portal/subscriptions`;
      } catch (error) {
        return res.status(503).json({
          code: "NOT_CONFIGURED",
          message: error instanceof Error ? error.message : "PUBLIC_WEB_URL must be configured in production.",
        });
      }
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: returnUrl,
    });

    return res.status(201).json({ data: { url: session.url }, error: null });
  },
);

