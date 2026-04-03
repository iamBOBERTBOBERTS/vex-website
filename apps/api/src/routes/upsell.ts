import { Router } from "express";
import { UpsellOfferSchema, UsageEventSchema } from "@vex/shared";
import { requireAuth } from "../middleware/auth.js";
import { requireAnyAuthenticatedRole, requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { prisma } from "../lib/tenant.js";

export const upsellRouter: Router = Router();

upsellRouter.post("/usage", requireAuth, requireAnyAuthenticatedRole(), validateBody(UsageEventSchema), async (req, res) => {
  const body = req.body as { kind: string; quantity: number; amountUsd?: number; refId?: string };
  const dedupeKey = body.refId ? `${body.kind}:${body.refId}` : null;
  if (dedupeKey) {
    const existing = await prisma.auditLog.findFirst({
      where: { tenantId: req.tenantId!, action: "USAGE_EVENT_INGESTED", entityId: dedupeKey },
      select: { id: true },
    });
    if (existing) return res.json({ data: { deduped: true }, error: null });
  }

  await prisma.usageLog.create({
    data: {
      tenantId: req.tenantId!,
      kind: body.kind,
      quantity: body.quantity,
      amountUsd: body.amountUsd,
      meta: { refId: body.refId ?? null },
    },
  });
  if (body.kind !== "appraisal") {
    await prisma.growthMetric.create({
      data: {
        tenantId: req.tenantId!,
        key: "usage_event",
        value: body.quantity,
        meta: { kind: body.kind, refId: body.refId ?? null },
      },
    });
  }
  if (typeof body.amountUsd === "number" && body.amountUsd > 0) {
    const dailyUsage = await prisma.usageLog.aggregate({
      where: {
        tenantId: req.tenantId!,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      _sum: { amountUsd: true },
    });
    const daySpend = Number(dailyUsage._sum.amountUsd ?? 0);
    if (daySpend > 10) {
      await prisma.auditLog.create({
        data: {
          tenantId: req.tenantId!,
          actorId: req.user?.userId,
          action: "USAGE_SPEND_ALERT",
          entity: "UsageLog",
          payload: { daySpendUsd: daySpend, thresholdUsd: 10 },
        },
      });
    }
  }
  await prisma.auditLog.create({
    data: {
      tenantId: req.tenantId!,
      actorId: req.user?.userId,
      action: "USAGE_EVENT_INGESTED",
      entity: "UsageLog",
      entityId: dedupeKey ?? undefined,
      payload: { kind: body.kind, quantity: body.quantity },
    },
  });
  if (typeof body.amountUsd === "number" && body.amountUsd > 0) {
    await prisma.auditLog.create({
      data: {
        tenantId: req.tenantId!,
        actorId: req.user?.userId,
        action: "UPSELL_STRIPE_OVERAGE_INVOICE_QUEUED",
        entity: "Billing",
        entityId: dedupeKey ?? undefined,
        payload: { amountUsd: body.amountUsd, kind: body.kind, quantity: body.quantity },
      },
    });
  }
  return res.status(201).json({ data: { ok: true }, error: null });
});

upsellRouter.post("/offer", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), validateBody(UpsellOfferSchema), async (req, res) => {
  const body = req.body as { offerCode: string; variant: "A" | "B"; title: string; body: string; ctaUrl: string; expiresAt: string };
  await prisma.growthMetric.create({
    data: {
      tenantId: req.tenantId!,
      key: "upsell_offer_impression",
      value: 1,
      meta: body,
    },
  });
  await prisma.auditLog.create({
    data: {
      tenantId: req.tenantId!,
      actorId: req.user?.userId,
      action: "UPSELL_OFFER_CREATED",
      entity: "GrowthMetric",
      payload: body,
    },
  });
  return res.status(201).json({ data: body, error: null });
});
