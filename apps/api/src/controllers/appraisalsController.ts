import { Request, Response } from "express";
import type { CreateAppraisalInput, UpdateAppraisalInput, ValuationInput } from "@vex/shared";
import { prisma } from "../lib/tenant.js";
import { estimateFromVehicleBasePrice } from "../lib/appraisalValuation.js";
import { mapAppraisalToOutput } from "../lib/appraisalMapper.js";
import { sendLifecycleNotification } from "../lib/notify.js";
import { ValuationService } from "../lib/valuation.js";
import { enqueueAppraisalPdfGenerate } from "../lib/queue.js";
import { isDealDeskAppraisalRole, isDealerStaffRole } from "../lib/dealerRole.js";
import { addAppraisalToInventory, updateDealDeskStatus } from "../services/dealDeskService.js";

const valuationService = new ValuationService();

async function enforceFreeTierQuota(tenantId: string) {
  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId },
    select: { billingTier: true },
  });
  if (!tenant) return;
  if (tenant.billingTier !== "STARTER") return;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const used = await prisma.usageLog.aggregate({
    where: { tenantId, kind: "APPRAISAL_CALL", createdAt: { gte: monthStart } },
    _sum: { quantity: true },
  });
  const total = Number(used._sum.quantity ?? 0);
  if (total >= 5) {
    const err = new Error("FREE_TIER_LIMIT");
    (err as Error & { code?: string }).code = "FREE_TIER_LIMIT";
    throw err;
  }
}

async function computeValueForVehicle(vehicleId: string): Promise<number | null> {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId },
    include: { inventory: { take: 1, orderBy: { updatedAt: "desc" } } },
  });
  if (!vehicle) return null;
  const mileage = vehicle.inventory[0]?.mileage ?? 0;
  return estimateFromVehicleBasePrice(vehicle.year, mileage, Number(vehicle.basePrice));
}

export async function list(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealDeskAppraisalRole(user.role)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff, admin, or group admin required." });
  }

  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Number(req.query.offset) || 0;

  const [rows, total] = await Promise.all([
    prisma.appraisal.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        vehicle: { select: { id: true, make: true, model: true, trimLevel: true, year: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
    }),
    prisma.appraisal.count(),
  ]);

  return res.json({
    data: { items: rows.map(mapAppraisalToOutput), total, limit, offset },
    error: null,
  });
}

export async function create(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealerStaffRole(user.role)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });
  }

  const body = req.body as CreateAppraisalInput;
  try {
    await enforceFreeTierQuota(req.tenantId!);
  } catch (e) {
    if ((e as { code?: string }).code === "FREE_TIER_LIMIT") {
      return res.status(402).json({ code: "FREE_TIER_LIMIT", message: "Starter tier is limited to 5 appraisals/month." });
    }
    throw e;
  }

  if (body.vehicleId) {
    const v = await prisma.vehicle.findFirst({ where: { id: body.vehicleId } });
    if (!v) return res.status(400).json({ code: "BAD_REQUEST", message: "Vehicle not found" });
  }
  if (body.customerId) {
    const c = await prisma.customer.findFirst({ where: { id: body.customerId } });
    if (!c) return res.status(400).json({ code: "BAD_REQUEST", message: "Customer not found" });
  }

  let value: number | null = null;
  if (body.vehicleId) {
    value = await computeValueForVehicle(body.vehicleId);
  }

  const status = body.status ?? "pending";

  const appraisal = await prisma.appraisal.create({
    data: {
      tenantId: req.tenantId!,
      vehicleId: body.vehicleId ?? null,
      customerId: body.customerId ?? null,
      notes: body.notes ?? null,
      status,
      value,
      valuationSource: "manual",
    },
    include: {
      vehicle: { select: { id: true, make: true, model: true, trimLevel: true, year: true } },
      customer: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  await prisma.auditLog.create({
    data: {
      tenantId: req.tenantId!,
      actorId: user.userId,
      action: "APPRAISAL_CREATE",
      entity: "Appraisal",
      entityId: appraisal.id,
    },
  });

  if (appraisal.customer?.email) {
    void sendLifecycleNotification({
      type: "APPRAISAL_COMPLETE",
      toEmail: appraisal.customer.email,
      smsTo: appraisal.customer.phone ?? undefined,
      subject: "Your appraisal is ready",
      message: `Your vehicle appraisal is ready. Value: ${appraisal.value != null ? `$${Number(appraisal.value).toLocaleString()}` : "pending"}.`,
    });
  }

  return res.status(201).json({ data: mapAppraisalToOutput(appraisal), error: null });
}

export async function getById(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealDeskAppraisalRole(user.role)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff, admin, or group admin required." });
  }

  const { id } = req.params;
  const appraisal = await prisma.appraisal.findFirst({
    where: { id, tenantId: req.tenantId! },
    include: {
      vehicle: { select: { id: true, make: true, model: true, trimLevel: true, year: true } },
      customer: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!appraisal) return res.status(404).json({ code: "NOT_FOUND", message: "Appraisal not found" });

  return res.json({ data: mapAppraisalToOutput(appraisal), error: null });
}

export async function update(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealerStaffRole(user.role)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });
  }

  const { id } = req.params;
  const body = req.body as UpdateAppraisalInput;

  const existing = await prisma.appraisal.findFirst({ where: { id } });
  if (!existing) return res.status(404).json({ code: "NOT_FOUND", message: "Appraisal not found" });

  if (body.vehicleId !== undefined && body.vehicleId !== null) {
    const v = await prisma.vehicle.findFirst({ where: { id: body.vehicleId } });
    if (!v) return res.status(400).json({ code: "BAD_REQUEST", message: "Vehicle not found" });
  }
  if (body.customerId !== undefined && body.customerId !== null) {
    const c = await prisma.customer.findFirst({ where: { id: body.customerId } });
    if (!c) return res.status(400).json({ code: "BAD_REQUEST", message: "Customer not found" });
  }

  const data: {
    vehicleId?: string | null;
    customerId?: string | null;
    notes?: string | null;
    status?: string;
    value?: number | null;
  } = {};

  if (body.vehicleId !== undefined) data.vehicleId = body.vehicleId;
  if (body.customerId !== undefined) data.customerId = body.customerId;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.status !== undefined) data.status = body.status;

  if (body.value !== undefined) {
    data.value = body.value;
  } else if (body.vehicleId !== undefined && body.vehicleId !== null) {
    const v = await computeValueForVehicle(body.vehicleId);
    if (v != null) data.value = v;
  }

  await prisma.appraisal.updateMany({ where: { id }, data });
  await prisma.auditLog.create({
    data: {
      tenantId: req.tenantId!,
      actorId: user.userId,
      action: "APPRAISAL_UPDATE",
      entity: "Appraisal",
      entityId: id,
      payload: { keys: Object.keys(data) },
    },
  });

  const appraisal = await prisma.appraisal.findFirst({
    where: { id },
    include: {
      vehicle: { select: { id: true, make: true, model: true, trimLevel: true, year: true } },
      customer: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!appraisal) return res.status(404).json({ code: "NOT_FOUND", message: "Appraisal not found" });

  if (appraisal.customer?.email && body.status === "completed") {
    void sendLifecycleNotification({
      type: "APPRAISAL_COMPLETE",
      toEmail: appraisal.customer.email,
      smsTo: appraisal.customer.phone ?? undefined,
      subject: "Appraisal updated",
      message: `Your appraisal has been updated. Value: ${appraisal.value != null ? `$${Number(appraisal.value).toLocaleString()}` : "pending"}.`,
    });
  }

  return res.json({ data: mapAppraisalToOutput(appraisal), error: null });
}

export async function remove(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealerStaffRole(user.role)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });
  }

  const { id } = req.params;
  const result = await prisma.appraisal.deleteMany({ where: { id } });
  if (result.count === 0) return res.status(404).json({ code: "NOT_FOUND", message: "Appraisal not found" });
  await prisma.auditLog.create({
    data: {
      tenantId: req.tenantId!,
      actorId: user.userId,
      action: "APPRAISAL_DELETE",
      entity: "Appraisal",
      entityId: id,
    },
  });

  return res.json({ data: { deleted: true }, error: null });
}


export async function valuate(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealerStaffRole(user.role)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });
  }

  const body = req.body as ValuationInput;
  try {
    await enforceFreeTierQuota(req.tenantId!);
  } catch (e) {
    if ((e as { code?: string }).code === "FREE_TIER_LIMIT") {
      return res.status(402).json({ data: null, error: { code: "FREE_TIER_LIMIT", message: "Starter tier is limited to 5 appraisals/month." } });
    }
    throw e;
  }
  if (!req.tenantId) {
    return res.status(401).json({ data: null, error: { code: "UNAUTHORIZED", message: "Tenant context missing" } });
  }
  const input: ValuationInput = { ...body, tenantId: req.tenantId };
  const outcome = await valuationService.getValuation(input);

  if (!outcome.success) {
    const failure = outcome as Extract<typeof outcome, { success: false }>;
    return res.status(502).json({
      data: null,
      error: { code: failure.errorCode, message: "Valuation provider unavailable", fallbackValue: failure.fallbackValue },
    });
  }

  let appraisalId = body.appraisalId ?? null;
  if (appraisalId) {
    await prisma.appraisal.updateMany({
      where: { id: appraisalId },
      data: {
        value: outcome.result.valueAvg,
        valuationData: outcome.result.rawData as unknown as object,
        valuationSource: outcome.result.source,
        valuationFetchedAt: outcome.result.timestamp,
      },
    });
  } else {
    const created = await prisma.appraisal.create({
      data: {
        tenantId: req.tenantId!,
        status: "completed",
        value: outcome.result.valueAvg,
        notes: `${input.year} ${input.make} ${input.model} @ ${input.mileage}mi`,
        valuationData: outcome.result.rawData as unknown as object,
        valuationSource: outcome.result.source,
        valuationFetchedAt: outcome.result.timestamp,
      },
    });
    appraisalId = created.id;
  }

  void enqueueAppraisalPdfGenerate({
    tenantId: req.tenantId!,
    appraisalId,
    requestedByUserId: user.userId,
  });
  await prisma.usageLog.create({
    data: {
      tenantId: req.tenantId!,
      kind: "APPRAISAL_CALL",
      quantity: 1,
      amountUsd: 0,
      meta: { source: outcome.result.source },
    },
  });

  return res.json({
    data: {
      appraisalId,
      source: outcome.result.source,
      valueLow: outcome.result.valueLow,
      valueAvg: outcome.result.valueAvg,
      valueHigh: outcome.result.valueHigh,
      currency: outcome.result.currency,
      confidence: outcome.result.confidence,
      timestamp: outcome.result.timestamp,
      rawData: outcome.result.rawData,
    },
    error: null,
  });
}

export async function openDealDesk(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealDeskAppraisalRole(user.role)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff, admin, or group admin required." });
  }
  if (!req.tenantId) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Tenant context missing" });
  }

  const { id } = req.params;
  const status = String(req.body?.status ?? "OPEN") as "OPEN" | "ACCEPTED" | "REJECTED" | "NEGOTIATING" | "CLOSED";
  const note = typeof req.body?.note === "string" ? req.body.note : null;
  try {
    const result = await updateDealDeskStatus(prisma, {
      tenantId: req.tenantId,
      appraisalId: id,
      status,
      note,
      actorUserId: user.userId,
    });

    return res.status(201).json({
      data: {
        appraisalId: id,
        dealDesk: {
          status: result.status,
          note: result.note,
          inventoryId: result.inventoryId,
          orderId: result.orderId,
          invoiceNumber: result.invoiceNumber ?? null,
          updatedBy: user.userId,
          updatedAt: new Date().toISOString(),
        },
      },
      error: null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "APPRAISAL_NOT_FOUND") {
      return res.status(404).json({ code: "NOT_FOUND", message: "Appraisal not found" });
    }
    throw error;
  }
}

export async function addToInventoryFromAppraisal(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealDeskAppraisalRole(user.role)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff, admin, or group admin required." });
  }
  if (!req.tenantId) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Tenant context missing" });
  }

  const { id } = req.params;
  const listPriceRaw = req.body?.listPrice;
  const location = typeof req.body?.location === "string" ? req.body.location : null;
  const listPrice = typeof listPriceRaw === "number" ? listPriceRaw : undefined;

  try {
    const inventory = await addAppraisalToInventory(prisma, {
      tenantId: req.tenantId,
      appraisalId: id,
      actorUserId: user.userId,
      listPrice,
      location,
    });
    return res.status(201).json({
      data: {
        appraisalId: id,
        inventoryId: inventory.id,
        source: inventory.source,
      },
      error: null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "APPRAISAL_NOT_FOUND") {
      return res.status(404).json({ code: "NOT_FOUND", message: "Appraisal not found" });
    }
    throw error;
  }
}
