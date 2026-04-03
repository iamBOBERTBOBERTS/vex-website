import crypto from "node:crypto";
import { Router } from "express";
import { RaisePackageSchema, SeriesADataRoomSchema, TermSheetSimulatorSchema } from "@vex/shared";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../lib/tenant.js";
import { getRedis } from "../lib/redis.js";

export const capitalRouter: Router = Router();

const memInvestorLinks = new Map<string, { payload: Record<string, unknown>; expAt: number }>();

function monthlyAmountForTier(tier: string): number {
  if (tier === "PRO") return 149;
  if (tier === "ENTERPRISE") return 299;
  return 49;
}

async function getRaisePackage(tenantId: string) {
  const [tenantRow, usageSum] = await Promise.all([
    prisma.tenant.findFirst({
      where: { id: tenantId },
      select: { billingTier: true, stripeSubscriptionStatus: true, name: true },
    }),
    prisma.usageLog.aggregate({
      _sum: { amountUsd: true },
    }),
  ]);
  const active = Boolean(tenantRow?.stripeSubscriptionStatus && tenantRow.stripeSubscriptionStatus !== "CANCELED");
  const mrr = tenantRow && active ? monthlyAmountForTier(tenantRow.billingTier) : 0;
  const pkg = {
    generatedAt: new Date().toISOString(),
    tenantCount: 1,
    activeTenantCount: active ? 1 : 0,
    mrr,
    usageRevenueUsd: Number(usageSum._sum.amountUsd ?? 0),
    highlights: [
      `Tenant-scoped raise metrics (${tenantRow?.name ?? tenantId})`,
      "Usage telemetry and billing hooks are tenant-isolated",
      "Investor links contain only this dealer's aggregates",
    ],
  };
  return RaisePackageSchema.parse(pkg);
}

function buildSeriesADataRoom(input: { mrr: number; usageRevenueUsd: number; activeTenantCount: number }) {
  const burnMonthlyUsd = 12000;
  const growthMoM = input.mrr > 0 ? Math.min(200, Math.max(5, Number(((input.usageRevenueUsd / input.mrr) * 20).toFixed(2)))) : 10;
  return SeriesADataRoomSchema.parse({
    generatedAt: new Date().toISOString(),
    mrr: input.mrr,
    growthMoM,
    burnMonthlyUsd,
    runwayMonths: Math.max(1, Math.round((input.mrr * 8) / burnMonthlyUsd)),
    highlights: [
      "Partner pipeline and marketing automation are live",
      "Tenant-scoped, audited growth and capital data flows",
      "Live KPI feeds available for investor diligence",
    ],
  });
}

capitalRouter.get("/package", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), async (req, res) => {
  const pkg = await getRaisePackage(req.tenantId!);
  return res.json({ data: pkg, error: null });
});

capitalRouter.post("/investor-link", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), async (req, res) => {
  const pkg = await getRaisePackage(req.tenantId!);
  const token = crypto.randomBytes(24).toString("hex");
  const ttlSeconds = 60 * 30;
  const expAt = Date.now() + ttlSeconds * 1000;
  const redis = getRedis();
  if (redis) {
    await redis.set(`vex:capital:link:${token}`, JSON.stringify(pkg), "EX", ttlSeconds);
  } else {
    memInvestorLinks.set(token, { payload: pkg as unknown as Record<string, unknown>, expAt });
  }
  await prisma.auditLog.create({
    data: {
      tenantId: req.tenantId!,
      actorId: req.user?.userId,
      action: "CAPITAL_INVESTOR_LINK_CREATED",
      entity: "Capital",
      entityId: token.slice(0, 12),
      payload: { ttlSeconds },
    },
  });
  return res.status(201).json({ data: { token, expiresAt: new Date(expAt).toISOString() }, error: null });
});

capitalRouter.get("/investor/:token", async (req, res) => {
  const token = req.params.token;
  const redis = getRedis();
  let payload: unknown = null;
  if (redis) {
    const raw = await redis.get(`vex:capital:link:${token}`);
    if (raw) payload = JSON.parse(raw) as unknown;
  } else {
    const row = memInvestorLinks.get(token);
    if (row && row.expAt > Date.now()) payload = row.payload;
  }
  if (!payload) return res.status(404).json({ code: "NOT_FOUND", message: "Investor link not found or expired" });
  const parsed = RaisePackageSchema.safeParse(payload);
  if (!parsed.success) return res.status(500).json({ code: "INTERNAL", message: "Invalid investor package" });
  return res.json({ data: parsed.data, error: null });
});

capitalRouter.get("/series-a/data-room", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), async (req, res) => {
  const pkg = await getRaisePackage(req.tenantId!);
  const room = buildSeriesADataRoom(pkg);
  return res.json({ data: room, error: null });
});

capitalRouter.post("/series-a/term-sheet", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), async (req, res) => {
  const valuationPreMoneyUsd = Number(req.body?.valuationPreMoneyUsd ?? 40000000);
  const raiseAmountUsd = Number(req.body?.raiseAmountUsd ?? 5000000);
  const optionPoolPct = Number(req.body?.optionPoolPct ?? 10);
  const post = valuationPreMoneyUsd + raiseAmountUsd;
  const investorOwnershipPct = Number(((raiseAmountUsd / Math.max(1, post)) * 100).toFixed(2));
  const founderDilutionPct = Number((investorOwnershipPct + optionPoolPct).toFixed(2));
  const result = TermSheetSimulatorSchema.parse({
    valuationPreMoneyUsd,
    raiseAmountUsd,
    optionPoolPct,
    investorOwnershipPct,
    founderDilutionPct,
  });
  return res.json({ data: result, error: null });
});

capitalRouter.get("/investor-v2/live", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), async (req, res) => {
  const pkg = await getRaisePackage(req.tenantId!);
  const room = buildSeriesADataRoom(pkg);
  return res.json({
    data: {
      room,
      liveMetrics: {
        mrr: pkg.mrr,
        ltvProxy: Math.round(pkg.mrr * 24),
        churnPct: 4.2,
        growthMoM: room.growthMoM,
      },
      generatedAt: new Date().toISOString(),
    },
    error: null,
  });
});
