import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../lib/tenant.js";
import { getRedis } from "../lib/redis.js";

export const scalingRouter: Router = Router();

function monthlyAmountForTier(tier: string): number {
  if (tier === "PRO") return 149;
  if (tier === "ENTERPRISE") return 299;
  return 49;
}

scalingRouter.get("/overview", requireAuth, requireRole("GROUP_ADMIN"), async (req, res) => {
  const cacheKey = `vex:scaling:${req.tenantId}`;
  const redis = getRedis();
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return res.json({ data: JSON.parse(cached), error: null });
  }
  const [tenants, partnerRevenue, marketingConversions] = await Promise.all([
    prisma.tenant.findMany({
      where: { id: req.tenantId! },
      select: { billingTier: true, stripeSubscriptionStatus: true },
    }),
    prisma.usageLog.aggregate({ where: { kind: "partner_payout" }, _sum: { amountUsd: true } }),
    prisma.growthMetric.aggregate({ where: { key: "marketing_conversion" }, _sum: { value: true } }),
  ]);
  const active = tenants.filter((t) => t.stripeSubscriptionStatus && t.stripeSubscriptionStatus !== "CANCELED");
  const mrr = active.reduce((sum, t) => sum + monthlyAmountForTier(t.billingTier), 0);
  const partnerSpendUsd = Number(partnerRevenue._sum.amountUsd ?? 0);
  const projectionTo100kMonths = Math.max(0, Math.ceil((100000 - mrr) / Math.max(1, mrr * 0.08)));
  const payload = {
    mrr,
    targetMrr: 100000,
    marketingConversionUsd: Number(marketingConversions._sum.value ?? 0),
    partnerSpendUsd,
    partnerSpendPctOfMrr: mrr > 0 ? Number(((partnerSpendUsd / mrr) * 100).toFixed(2)) : 0,
    projectionTo100kMonths,
    generatedAt: new Date().toISOString(),
  };
  if (redis) await redis.set(cacheKey, JSON.stringify(payload), "EX", 5);
  return res.json({ data: payload, error: null });
});
