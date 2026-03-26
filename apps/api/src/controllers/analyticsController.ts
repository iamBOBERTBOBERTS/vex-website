import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/tenant.js";

function toNumber(v: Prisma.Decimal | null | undefined): number {
  if (v == null) return 0;
  return Number(v);
}

export async function getAnalytics(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (user.role !== "STAFF" && user.role !== "ADMIN") {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    inventoryCount,
    leadsNew,
    leadsContacted,
    leadsQualified,
    leadsLost,
    ordersDraft,
    ordersDepositPaid,
    ordersConfirmed,
    ordersFulfilled,
    revenueAgg,
    ordersForTrend,
  ] = await Promise.all([
    prisma.inventory.count({ where: { status: "AVAILABLE" } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { status: "CONTACTED" } }),
    prisma.lead.count({ where: { status: "QUALIFIED" } }),
    prisma.lead.count({ where: { status: "LOST" } }),
    prisma.order.count({ where: { status: "DRAFT" } }),
    prisma.order.count({ where: { status: "DEPOSIT_PAID" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.count({ where: { status: "FULFILLED" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { totalAmount: { not: null } },
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        totalAmount: { not: null },
      },
      select: { totalAmount: true, createdAt: true },
    }),
  ]);

  const leadsTotal = leadsNew + leadsContacted + leadsQualified + leadsLost;
  const revenueTotal = toNumber(revenueAgg._sum.totalAmount);

  const monthBuckets = new Map<string, number>();
  const monthLabel = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  for (const o of ordersForTrend) {
    const key = monthLabel(new Date(o.createdAt));
    monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + toNumber(o.totalAmount));
  }

  const revenueByMonth = Array.from(monthBuckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));

  return res.json({
    data: {
      inventoryCount,
      leadsTotal,
      leadsConverted: leadsQualified,
      leadsByStatus: {
        NEW: leadsNew,
        CONTACTED: leadsContacted,
        QUALIFIED: leadsQualified,
        LOST: leadsLost,
      },
      ordersByStatus: {
        DRAFT: ordersDraft,
        DEPOSIT_PAID: ordersDepositPaid,
        CONFIRMED: ordersConfirmed,
        FULFILLED: ordersFulfilled,
      },
      revenueTotal,
      revenueByMonth,
    },
    error: null,
  });
}

