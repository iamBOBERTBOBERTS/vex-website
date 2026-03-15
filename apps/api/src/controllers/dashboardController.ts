import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth.js";

const prisma = new PrismaClient();

export async function stats(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (user.role !== "STAFF" && user.role !== "ADMIN") {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });
  }

  const [leadsNew, leadsTotal, ordersDraft, ordersDepositPaid, ordersConfirmed, ordersFulfilled, inventoryAvailable] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count(),
    prisma.order.count({ where: { status: "DRAFT" } }),
    prisma.order.count({ where: { status: "DEPOSIT_PAID" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.count({ where: { status: "FULFILLED" } }),
    prisma.inventory.count({ where: { status: "AVAILABLE" } }),
  ]);

  return res.json({
    leads: { new: leadsNew, total: leadsTotal },
    orders: { draft: ordersDraft, depositPaid: ordersDepositPaid, confirmed: ordersConfirmed, fulfilled: ordersFulfilled },
    inventory: { available: inventoryAvailable },
  });
}
