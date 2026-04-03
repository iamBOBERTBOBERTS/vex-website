import { prisma } from "./tenant.js";

type LiquidityScenario = {
  path: "ACQUISITION" | "IPO";
  currentMrr: number;
  targetMrr: number;
  arrMultiple: number;
  estimatedEnterpriseValue: number;
  monthsToTarget: number;
};

export async function simulateLiquidity(tenantId: string): Promise<{
  generatedAt: string;
  acquisition: LiquidityScenario;
  ipo: LiquidityScenario;
}> {
  const tenants = await prisma.tenant.findMany({
    where: { id: tenantId },
    select: { billingTier: true, stripeSubscriptionStatus: true },
  });
  const active = tenants.filter((t) => t.stripeSubscriptionStatus && t.stripeSubscriptionStatus !== "CANCELED");
  const currentMrr = active.reduce((sum, t) => sum + (t.billingTier === "ENTERPRISE" ? 299 : t.billingTier === "PRO" ? 149 : 49), 0);
  const targetMrr = 5000000;

  const acquisition: LiquidityScenario = {
    path: "ACQUISITION",
    currentMrr,
    targetMrr,
    arrMultiple: 20,
    estimatedEnterpriseValue: currentMrr * 12 * 20,
    monthsToTarget: Math.max(1, Math.ceil((targetMrr - currentMrr) / Math.max(1, currentMrr * 0.1))),
  };
  const ipo: LiquidityScenario = {
    path: "IPO",
    currentMrr,
    targetMrr,
    arrMultiple: 28,
    estimatedEnterpriseValue: currentMrr * 12 * 28,
    monthsToTarget: Math.max(1, Math.ceil((targetMrr - currentMrr) / Math.max(1, currentMrr * 0.08))),
  };
  return { generatedAt: new Date().toISOString(), acquisition, ipo };
}
