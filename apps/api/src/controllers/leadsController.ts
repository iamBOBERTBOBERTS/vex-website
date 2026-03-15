import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import type { CreateLeadInput, UpdateLeadInput } from "@vex/shared";
import { requireAuth } from "../middleware/auth.js";

const prisma = new PrismaClient();

function requireStaff(req: Request, res: Response): boolean {
  const user = req.user;
  if (!user) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
    return false;
  }
  if (user.role !== "STAFF" && user.role !== "ADMIN") {
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
  });
}

export async function create(req: Request, res: Response) {
  const body = req.body as CreateLeadInput;
  const user = req.user;
  const isStaff = user && (user.role === "STAFF" || user.role === "ADMIN");

  const lead = await prisma.lead.create({
    data: {
      source: body.source ?? "WEBSITE",
      email: body.email ?? null,
      phone: body.phone ?? null,
      name: body.name ?? null,
      vehicleInterest: body.vehicleInterest ?? null,
      notes: body.notes ?? null,
      assignedToId: isStaff ? user?.userId : null,
    },
  });

  return res.status(201).json({
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
  });
}

export async function getById(req: Request, res: Response) {
  if (!requireStaff(req, res)) return;

  const { id } = req.params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { assignedTo: { select: { id: true, email: true, name: true } } },
  });
  if (!lead) return res.status(404).json({ code: "NOT_FOUND", message: "Lead not found" });

  return res.json({
    ...lead,
    assignedTo: lead.assignedTo,
  });
}

export async function update(req: Request, res: Response) {
  if (!requireStaff(req, res)) return;

  const { id } = req.params;
  const body = req.body as UpdateLeadInput;

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(body.status != null && { status: body.status }),
      ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId || null }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.name !== undefined && { name: body.name }),
    },
    include: { assignedTo: { select: { id: true, email: true, name: true } } },
  });

  return res.json(lead);
}
