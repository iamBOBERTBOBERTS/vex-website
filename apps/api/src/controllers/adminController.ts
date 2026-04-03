import { Request, Response } from "express";
import { runWithTenant, prisma } from "../lib/tenant.js";

function monthlyAmountForTier(tier: string): number {
  if (tier === "PRO") return 149;
  if (tier === "ENTERPRISE") return 299;
  return 49;
}

export async function overview(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (user.role !== "ADMIN" && user.role !== "GROUP_ADMIN") {
    return res.status(403).json({ code: "FORBIDDEN", message: "Admin role required" });
  }
  const tenantId = req.tenantId;
  if (!tenantId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Tenant context missing" });

  const data = await runWithTenant(tenantId, async () => {
    const tenants = await prisma.tenant.findMany({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        billingTier: true,
        stripeSubscriptionStatus: true,
        customDomain: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    const active = tenants.filter((t) => t.stripeSubscriptionStatus && t.stripeSubscriptionStatus !== "CANCELED");
    const mrr = active.reduce((sum, t) => sum + monthlyAmountForTier(t.billingTier), 0);

    return {
      mrr,
      activeTenants: active.length,
      tenants: tenants.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
    };
  });

  return res.json({ data, error: null });
}

/** Admin MRR: `totalMrr` is derived from tenant billing tier + Stripe subscription status; `usageByKind` is `UsageLog` telemetry (appraisals, checkouts, etc.). Scoped to the authenticated tenant. */
export async function mrr(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (user.role !== "ADMIN" && user.role !== "GROUP_ADMIN") {
    return res.status(403).json({ code: "FORBIDDEN", message: "Admin role required" });
  }
  const tenantId = req.tenantId;
  if (!tenantId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Tenant context missing" });

  const payload = await runWithTenant(tenantId, async () => {
    const tenants = await prisma.tenant.findMany({
      where: { id: tenantId },
      select: { id: true, billingTier: true, stripeSubscriptionStatus: true, createdAt: true },
    });
    const active = tenants.filter((t) => t.stripeSubscriptionStatus && t.stripeSubscriptionStatus !== "CANCELED");
    const totalMrr = active.reduce((sum, t) => sum + monthlyAmountForTier(t.billingTier), 0);
    const usageByKindRows = await prisma.usageLog.groupBy({
      by: ["kind"],
      _sum: { quantity: true, amountUsd: true },
    });

    const usageByKind = usageByKindRows.map((r) => ({
      kind: r.kind,
      quantity: r._sum.quantity ?? 0,
      amountUsd: Number(r._sum.amountUsd ?? 0),
    }));

    return {
      totalMrr,
      activeTenants: active.length,
      usageByKind,
      generatedAt: new Date().toISOString(),
    };
  });

  return res.json({ data: payload, error: null });
}
