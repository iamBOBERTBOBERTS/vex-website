import { Request, Response } from "express";
import { prisma } from "../lib/tenant.js";
import { optionalJson } from "../utils/prismaJson.js";
import type { CreateOrderInput, UpdateOrderInput } from "@vex/shared";
import { isDealerStaffRole } from "../lib/dealerRole.js";

function toShipment(s: { id: string; carrier: string | null; trackingUrl: string | null; status: string; estimatedDelivery: Date | null; quoteAmount: unknown; origin: string | null; destination: string | null }) {
  return {
    id: s.id,
    carrier: s.carrier,
    trackingUrl: s.trackingUrl,
    status: s.status,
    estimatedDelivery: s.estimatedDelivery,
    quoteAmount: s.quoteAmount != null ? Number(s.quoteAmount) : null,
    origin: s.origin,
    destination: s.destination,
  };
}

function toOrder(
  record: {
    id: string;
    userId: string;
    type: string;
    inventoryId: string | null;
    vehicleId: string | null;
    configSnapshot: unknown;
    status: string;
    depositAmount: unknown;
    totalAmount: unknown;
    financingSnapshot: unknown;
    tradeInSnapshot: unknown;
    shippingSnapshot: unknown;
    stylingAddonsSnapshot: unknown;
    createdAt: Date;
    updatedAt: Date;
    shipments?: Array<{ id: string; carrier: string | null; trackingUrl: string | null; status: string; estimatedDelivery: Date | null; quoteAmount: unknown; origin: string | null; destination: string | null }>;
  }
) {
  const base = {
    id: record.id,
    userId: record.userId,
    type: record.type,
    inventoryId: record.inventoryId,
    vehicleId: record.vehicleId,
    configSnapshot: record.configSnapshot,
    status: record.status,
    depositAmount: record.depositAmount != null ? Number(record.depositAmount) : null,
    totalAmount: record.totalAmount != null ? Number(record.totalAmount) : null,
    financingSnapshot: record.financingSnapshot,
    tradeInSnapshot: record.tradeInSnapshot,
    shippingSnapshot: record.shippingSnapshot,
    stylingAddonsSnapshot: record.stylingAddonsSnapshot,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
  if (record.shipments) {
    return { ...base, shipments: record.shipments.map(toShipment) };
  }
  return base;
}

export async function create(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });

  const body = req.body as CreateOrderInput;
  const order = await prisma.order.create({
    data: {
      tenant: { connect: { id: req.tenantId! } },
      user: { connect: { id: user.userId } },
      type: body.type,
      ...(body.inventoryId ? { inventory: { connect: { id: body.inventoryId } } } : {}),
      ...(body.vehicleId ? { vehicle: { connect: { id: body.vehicleId } } } : {}),
      configSnapshot: optionalJson(body.configSnapshot),
      status: body.status ?? "DRAFT",
      depositAmount: body.depositAmount ?? null,
      totalAmount: body.totalAmount ?? null,
      financingSnapshot: optionalJson(body.financingSnapshot),
      tradeInSnapshot: optionalJson(body.tradeInSnapshot),
      shippingSnapshot: optionalJson(body.shippingSnapshot),
      stylingAddonsSnapshot: optionalJson(body.stylingAddonsSnapshot),
    },
  });
  return res.status(201).json({ data: toOrder(order), error: null });
}

export async function list(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });

  const isStaff = isDealerStaffRole(user.role);
  const status = req.query.status as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;

  const where = isStaff ? {} : { userId: user.userId };
  if (status) (where as Record<string, unknown>).status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { shipments: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.order.count({ where }),
  ]);

  return res.json({ data: { items: orders.map(toOrder), total, limit, offset }, error: null });
}

export async function getById(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });

  const { id } = req.params;
  const order = await prisma.order.findFirst({ where: { id }, include: { shipments: true } });
  if (!order) return res.status(404).json({ code: "NOT_FOUND", message: "Order not found" });

  const isStaff = isDealerStaffRole(user.role);
  if (!isStaff && order.userId !== user.userId) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Not your order" });
  }

  return res.json({ data: toOrder(order), error: null });
}

export async function update(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });

  const { id } = req.params;
  const body = req.body as UpdateOrderInput;

  const existing = await prisma.order.findFirst({ where: { id } });
  if (!existing) return res.status(404).json({ code: "NOT_FOUND", message: "Order not found" });

  const isStaff = isDealerStaffRole(user.role);
  if (!isStaff && existing.userId !== user.userId) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Not your order" });
  }
  if (!isStaff && body.status && !["DRAFT", "DEPOSIT_PAID"].includes(body.status)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Only staff can set that status" });
  }

  const updated = await prisma.order.updateMany({
    where: { id },
    data: {
      ...(body.status != null && { status: body.status }),
      ...(body.depositAmount != null && { depositAmount: body.depositAmount }),
      ...(body.totalAmount != null && { totalAmount: body.totalAmount }),
    },
  });
  if (updated.count === 0) return res.status(404).json({ code: "NOT_FOUND", message: "Order not found" });
  const order = await prisma.order.findFirst({ where: { id } });
  if (!order) return res.status(404).json({ code: "NOT_FOUND", message: "Order not found" });
  return res.json({ data: toOrder(order), error: null });
}

export async function remove(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealerStaffRole(user.role)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });
  }
  const { id } = req.params;
  const deleted = await prisma.order.deleteMany({ where: { id } });
  if (deleted.count === 0) return res.status(404).json({ code: "NOT_FOUND", message: "Order not found" });
  return res.json({ data: { id }, error: null });
}
