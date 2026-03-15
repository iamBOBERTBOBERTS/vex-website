import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth.js";

const prisma = new PrismaClient();

export async function list(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (user.role !== "STAFF" && user.role !== "ADMIN") {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });
  }

  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Number(req.query.offset) || 0;

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: { id: true, email: true, name: true, phone: true, tier: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  return res.json({ items, total, limit, offset });
}

export async function getById(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (user.role !== "STAFF" && user.role !== "ADMIN") {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });
  }

  const { id } = req.params;
  const customer = await prisma.user.findFirst({
    where: { id, role: "CUSTOMER" },
    select: { id: true, email: true, name: true, phone: true, tier: true, createdAt: true },
  });
  if (!customer) return res.status(404).json({ code: "NOT_FOUND", message: "Customer not found" });

  const [orders, leads] = await Promise.all([
    prisma.order.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.lead.findMany({ where: { email: customer.email }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return res.json({
    ...customer,
    orders: orders.map((o) => ({ id: o.id, type: o.type, status: o.status, totalAmount: o.totalAmount != null ? Number(o.totalAmount) : null, createdAt: o.createdAt })),
    leads: leads.map((l) => ({ id: l.id, status: l.status, vehicleInterest: l.vehicleInterest, createdAt: l.createdAt })),
  });
}
