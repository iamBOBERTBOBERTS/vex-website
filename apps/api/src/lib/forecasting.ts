import { MrrForecastSchema, ScenarioModelSchema } from "@vex/shared";
import { prisma } from "./tenant.js";

function monthlyAmountForTier(tier: string): number {
  if (tier === "PRO") return 149;
  if (tier === "ENTERPRISE") return 299;
  return 49;
}

export async function buildMrrForecast(tenantId: string) {
  const tenants = await prisma.tenant.findMany({
    where: { id: tenantId },
    select: { billingTier: true, stripeSubscriptionStatus: true },
  });
  const active = tenants.filter((t) => t.stripeSubscriptionStatus && t.stripeSubscriptionStatus !== "CANCELED");
  const currentMrr = active.reduce((sum, t) => sum + monthlyAmountForTier(t.billingTier), 0);
  return MrrForecastSchema.parse({
    generatedAt: new Date().toISOString(),
    currentMrr,
    projectedMrr90d: Math.round(currentMrr * 1.35),
    projectedMrr180d: Math.round(currentMrr * 1.85),
    confidence: 74,
  });
}

export function buildScenarioModel(input: { currentMrr: number; acquisitionLiftPct: number; churnDeltaPct: number }) {
  const lift = Math.max(-100, Math.min(500, input.acquisitionLiftPct));
  const churn = Math.max(-100, Math.min(100, input.churnDeltaPct));
  const projected = Math.max(0, Math.round(input.currentMrr * (1 + lift / 100) * (1 - churn / 100)));
  return ScenarioModelSchema.parse({
    name: "custom",
    acquisitionLiftPct: lift,
    churnDeltaPct: churn,
    projectedMrr: projected,
  });
}
