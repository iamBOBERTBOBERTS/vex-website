import { Router } from "express";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { prisma } from "../lib/tenant.js";
import { valuationConfig } from "../config/valuation.js";
import { getPublicWebOrigin } from "../lib/publicOrigins.js";

const usageEventSchema = z.object({
  kind: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  amountUsd: z.number().nonnegative().optional(),
  meta: z.record(z.any()).optional(),
});

export const billingRouter: Router = Router();

billingRouter.get("/usage", requireAuth, requireRole("STAFF", "ADMIN", "GROUP_ADMIN"), async (req, res) => {
  const tenantId = req.tenantId;
  if (!tenantId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Tenant context missing" });

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(dayStart.getFullYear(), dayStart.getMonth(), 1);

  const [todayValuation, publicIntakeToday, monthUsage, overageUsd, appraisalCount, closedAppraisalCount, tenantRow, recentAppraisals, recentOrders, recentUsage] =
    await Promise.all([
      prisma.usageLog.aggregate({
        where: {
          tenantId,
          kind: "APPRAISAL_CALL",
          createdAt: { gte: dayStart },
        },
        _sum: { amountUsd: true, quantity: true },
      }),
      prisma.usageLog.count({
        where: {
          tenantId,
          kind: "PUBLIC_APPRAISAL",
          createdAt: { gte: dayStart },
        },
      }),
      prisma.usageLog.aggregate({
        where: { tenantId, createdAt: { gte: monthStart } },
        _sum: { amountUsd: true, quantity: true },
      }),
      prisma.usageLog.aggregate({
        where: { tenantId, kind: "valuation_overage", createdAt: { gte: dayStart } },
        _sum: { amountUsd: true },
      }),
      prisma.appraisal.count({ where: { tenantId } }),
      prisma.appraisal.count({ where: { tenantId, status: "closed" } }),
      prisma.tenant.findFirst({
        where: { id: tenantId },
        select: { groupSettings: true },
      }),
      prisma.appraisal.findMany({
        where: { tenantId },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { id: true, status: true, updatedAt: true, value: true },
      }),
      prisma.order.findMany({
        where: { tenantId, status: { in: [OrderStatus.CONFIRMED, OrderStatus.FULFILLED] } },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: { id: true, status: true, updatedAt: true, totalAmount: true },
      }),
      prisma.usageLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, kind: true, createdAt: true, amountUsd: true, quantity: true },
      }),
    ]);

  const todayValuationUsd = Number(todayValuation._sum.amountUsd ?? 0);
  const dailyCap = valuationConfig.costCaps.dailyUsdCap;
  const dailyRemainingUsd = Math.max(0, dailyCap - todayValuationUsd);

  const now = new Date();
  const msSinceMidnight = now.getTime() - dayStart.getTime();
  const msUntilMidnight = 86400000 - msSinceMidnight;
  const hoursElapsed = Math.max(1 / 60, msSinceMidnight / 3600000);
  const burnRatePerHour = todayValuationUsd / hoursElapsed;
  const projectedSpendEodUsd = Math.min(dailyCap, todayValuationUsd + burnRatePerHour * (msUntilMidnight / 3600000));
  const projectedRemainingEodUsd = Math.max(0, dailyCap - projectedSpendEodUsd);

  const gs = tenantRow?.groupSettings as { pilotSubdomain?: string; pilotNpsSubmittedAt?: string } | null;
  let webBase: string;
  try {
    webBase = getPublicWebOrigin();
  } catch (error) {
    return res.status(503).json({
      code: "NOT_CONFIGURED",
      message: error instanceof Error ? error.message : "PUBLIC_WEB_URL must be configured in production.",
    });
  }
  const inviteCustomerUrl = `${webBase.replace(/\/$/, "")}/appraisal?tenantId=${encodeURIComponent(tenantId)}`;
  const npsAlreadySubmitted = Boolean(gs?.pilotNpsSubmittedAt);

  return res.json({
    data: {
      tenantId,
      pilot: {
        pilotSubdomain: gs?.pilotSubdomain ?? null,
        appraisalCount,
        inviteCustomerUrl,
        showNpsAfterFirstAppraisalClose: closedAppraisalCount >= 1 && !npsAlreadySubmitted,
      },
      valuation: {
        dailyCapUsd: dailyCap,
        spentTodayUsd: todayValuationUsd,
        remainingTodayUsd: dailyRemainingUsd,
        callsToday: Number(todayValuation._sum.quantity ?? 0),
        projectedSpendEodUsd,
        projectedRemainingEodUsd,
        publicIntakeToday,
      },
      activity: {
        appraisals: recentAppraisals.map((a) => ({
          id: a.id,
          status: a.status,
          updatedAt: a.updatedAt.toISOString(),
          value: a.value != null ? Number(a.value) : null,
        })),
        closedDeals: recentOrders.map((o) => ({
          id: o.id,
          status: o.status,
          updatedAt: o.updatedAt.toISOString(),
          totalAmount: o.totalAmount != null ? Number(o.totalAmount) : null,
        })),
        usageEvents: recentUsage.map((u) => ({
          id: u.id,
          kind: u.kind,
          createdAt: u.createdAt.toISOString(),
          amountUsd: u.amountUsd != null ? Number(u.amountUsd) : null,
          quantity: u.quantity,
        })),
      },
      usageMonth: {
        quantity: Number(monthUsage._sum.quantity ?? 0),
        amountUsd: Number(monthUsage._sum.amountUsd ?? 0),
      },
      overage: {
        amountUsdToday: Number(overageUsd._sum.amountUsd ?? 0),
      },
    },
    error: null,
  });
});

billingRouter.post(
  "/usage",
  requireAuth,
  requireRole("ADMIN", "GROUP_ADMIN"),
  validateBody(usageEventSchema),
  async (req, res) => {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Tenant context missing" });
    const body = req.body as z.infer<typeof usageEventSchema>;

    const created = await prisma.usageLog.create({
      data: {
        tenantId,
        kind: body.kind,
        quantity: body.quantity,
        amountUsd: body.amountUsd,
        meta: body.meta,
      },
    });

    return res.status(201).json({ data: created, error: null });
  }
);

