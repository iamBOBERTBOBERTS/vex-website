import { Request, Response } from "express";
import { prisma } from "../lib/tenant.js";
import type { CreateCustomerInput, UpdateCustomerInput } from "@vex/shared";
import { isDealerStaffRole } from "../lib/dealerRole.js";

export async function list(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealerStaffRole(user.role)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });
  }

  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Number(req.query.offset) || 0;

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      select: { id: true, email: true, name: true, phone: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.customer.count(),
  ]);
  return res.json({ data: { items, total, limit, offset }, error: null });
}

export async function getById(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealerStaffRole(user.role)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });
  }

  const { id } = req.params;
  const customer = await prisma.customer.findFirst({
    where: { id },
    select: { id: true, email: true, name: true, phone: true, createdAt: true },
  });
  if (!customer) return res.status(404).json({ code: "NOT_FOUND", message: "Customer not found" });

  const [orders, leads] = await Promise.all([
    prisma.order.findMany({ where: { userId: customer.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.lead.findMany({ where: { email: customer.email }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return res.json({
    data: {
      ...customer,
      orders: orders.map((o) => ({ id: o.id, type: o.type, status: o.status, totalAmount: o.totalAmount != null ? Number(o.totalAmount) : null, createdAt: o.createdAt })),
      leads: leads.map((l) => ({ id: l.id, status: l.status, vehicleInterest: l.vehicleInterest, createdAt: l.createdAt })),
    },
    error: null,
  });
}

export async function create(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealerStaffRole(user.role)) return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });

  const body = req.body as CreateCustomerInput;
  const customer = await prisma.customer.create({
    data: {
      tenant: { connect: { id: req.tenantId! } },
      name: body.name ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
    },
  });
  return res.status(201).json({ data: customer, error: null });
}

export async function update(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealerStaffRole(user.role)) return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });

  const { id } = req.params;
  const body = req.body as UpdateCustomerInput;
  const updated = await prisma.customer.updateMany({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
    },
  });
  if (updated.count === 0) return res.status(404).json({ code: "NOT_FOUND", message: "Customer not found" });
  const customer = await prisma.customer.findFirst({ where: { id } });
  return res.json({ data: customer, error: null });
}

export async function remove(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealerStaffRole(user.role)) return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });

  const { id } = req.params;
  const deleted = await prisma.customer.deleteMany({ where: { id } });
  if (deleted.count === 0) return res.status(404).json({ code: "NOT_FOUND", message: "Customer not found" });
  return res.json({ data: { id }, error: null });
}
