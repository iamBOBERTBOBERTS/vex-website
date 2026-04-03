import { Request, Response } from "express";
import type { CreateLeadInput, UpdateLeadInput } from "@vex/shared";
import { prisma } from "../lib/tenant.js";
import { isDealerStaffRole } from "../lib/dealerRole.js";

function requireStaff(req: Request, res: Response): boolean {
  const user = req.user;
  if (!user) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
    return false;
  }
  if (!isDealerStaffRole(user.role)) {
    res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });
    return false;
  }
  return true;
}

export async function list(req: Request, res: Response) {
  if (!requireStaff(req, res)) return;

  const status = req.query.status as string | undefined;
  const assignedTo = req.query.assignedTo as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Number(req.query.offset) || 0;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (assignedTo) where.assignedToId = assignedTo;

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { assignedTo: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.lead.count({ where }),
  ]);

  return res.json({
    data: {
      items: items.map((l) => ({
      id: l.id,
      source: l.source,
      email: l.email,
      phone: l.phone,
      name: l.name,
      vehicleInterest: l.vehicleInterest,
      notes: l.notes,
      status: l.status,
      assignedToId: l.assignedToId,
      assignedTo: l.assignedTo,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
      })),
      total,
      limit,
      offset,
    },
    error: null,
  });
}

export async function create(req: Request, res: Response) {
  const body = req.body as CreateLeadInput;
  const user = req.user;
  const isStaff = user && isDealerStaffRole(user.role);

  const lead = await prisma.lead.create({
    data: {
      tenant: { connect: { id: req.tenantId! } },
      source: body.source ?? "WEBSITE",
      email: body.email ?? null,
      phone: body.phone ?? null,
      name: body.name ?? null,
      vehicleInterest: body.vehicleInterest ?? null,
      notes: body.notes ?? null,
      ...(isStaff ? { assignedTo: { connect: { id: user.userId } } } : {}),
    },
  });

  return res.status(201).json({
    data: {
      id: lead.id,
      source: lead.source,
      email: lead.email,
      phone: lead.phone,
      name: lead.name,
      vehicleInterest: lead.vehicleInterest,
      notes: lead.notes,
      status: lead.status,
      assignedToId: lead.assignedToId,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    },
    error: null,
  });
}

export async function getById(req: Request, res: Response) {
  if (!requireStaff(req, res)) return;

  const { id } = req.params;
  const lead = await prisma.lead.findFirst({
    where: { id },
    include: { assignedTo: { select: { id: true, email: true, name: true } } },
  });
  if (!lead) return res.status(404).json({ code: "NOT_FOUND", message: "Lead not found" });

  return res.json({
    data: {
      ...lead,
      assignedTo: lead.assignedTo,
    },
    error: null,
  });
}

export async function update(req: Request, res: Response) {
  if (!requireStaff(req, res)) return;

  const { id } = req.params;
  const body = req.body as UpdateLeadInput;

  const updated = await prisma.lead.updateMany({
    where: { id },
    data: {
      ...(body.status != null && { status: body.status }),
      ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId || null }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.name !== undefined && { name: body.name }),
    },
  });
  if (updated.count === 0) return res.status(404).json({ code: "NOT_FOUND", message: "Lead not found" });
  const lead = await prisma.lead.findFirst({ where: { id }, include: { assignedTo: { select: { id: true, email: true, name: true } } } });
  if (!lead) return res.status(404).json({ code: "NOT_FOUND", message: "Lead not found" });
  return res.json({ data: lead, error: null });
}

export async function remove(req: Request, res: Response) {
  if (!requireStaff(req, res)) return;
  const { id } = req.params;
  const deleted = await prisma.lead.deleteMany({ where: { id } });
  if (deleted.count === 0) return res.status(404).json({ code: "NOT_FOUND", message: "Lead not found" });
  return res.json({ data: { id }, error: null });
}
