import { Request, Response } from "express";
import { InventorySource, InventoryStatus, Prisma } from "@prisma/client";
import type { CreateInventoryInput, UpdateInventoryInput } from "@vex/shared";
import { isDealerStaffRole } from "../lib/dealerRole.js";
import { optionalJson } from "../utils/prismaJson.js";
import { prisma } from "../lib/tenant.js";

function toInventory(record: {
  id: string;
  source: string;
  vehicleId: string;
  listedByUserId: string | null;
  location: string | null;
  listPrice: { toNumber: () => number };
  mileage: number | null;
  status: string;
  vin: string | null;
  verificationStatus: string | null;
  imageUrls: unknown;
  specs: unknown;
  modelGlbUrl: string | null;
  modelSource: string | null;
  modelSourcePhotoIds: unknown;
  createdAt: Date;
  updatedAt: Date;
  vehicle?: unknown;
}) {
  const base = {
    id: record.id,
    source: record.source,
    vehicleId: record.vehicleId,
    listedByUserId: record.listedByUserId,
    location: record.location,
    listPrice: Number(record.listPrice),
    mileage: record.mileage,
    status: record.status,
    vin: record.vin,
    verificationStatus: record.verificationStatus,
    imageUrls: record.imageUrls as string[] | null,
    specs: record.specs as Record<string, unknown> | null,
    modelGlbUrl: record.modelGlbUrl,
    modelSource: record.modelSource,
    modelSourcePhotoIds: record.modelSourcePhotoIds as string[] | null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
  if (record.vehicle) {
    const v = record.vehicle as { id: string; make: string; model: string; trimLevel: string; year: number; basePrice: { toNumber: () => number }; bodyType: string | null; imageUrls: unknown };
    return {
      ...base,
      vehicle: {
        id: v.id,
        make: v.make,
        model: v.model,
        trimLevel: v.trimLevel,
        year: v.year,
        basePrice: Number(v.basePrice),
        bodyType: v.bodyType,
        imageUrls: v.imageUrls,
      },
    };
  }
  return base;
}

export async function list(req: Request, res: Response) {
  const source = req.query.source as string | undefined;
  const location = req.query.location as string | undefined;
  const minPrice = req.query.minPrice != null ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice != null ? Number(req.query.maxPrice) : undefined;
  const make = req.query.make as string | undefined;
  const model = req.query.model as string | undefined;
  const year = req.query.year != null ? Number(req.query.year) : undefined;
  const status = (req.query.status as string) || "AVAILABLE";
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;

  const vehicleWhere: { make?: string; model?: string; year?: number } = {};
  if (make) vehicleWhere.make = make;
  if (model) vehicleWhere.model = model;
  if (year) vehicleWhere.year = year;

  const listPriceWhere: { gte?: number; lte?: number } = {};
  if (minPrice != null && !Number.isNaN(minPrice)) listPriceWhere.gte = minPrice;
  if (maxPrice != null && !Number.isNaN(maxPrice)) listPriceWhere.lte = maxPrice;

  const where: Prisma.InventoryWhereInput = { status: status as InventoryStatus };
  if (source) where.source = source as InventorySource;
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (Object.keys(vehicleWhere).length > 0) where.vehicle = vehicleWhere;
  if (Object.keys(listPriceWhere).length > 0) where.listPrice = listPriceWhere;
  if (source === "PRIVATE_SELLER") where.verificationStatus = "APPROVED";

  const [items, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      include: { vehicle: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.inventory.count({ where }),
  ]);

  return res.json({
    data: {
      items: items.map(toInventory),
      total,
      limit,
      offset,
    },
    error: null,
  });
}

export async function getById(req: Request, res: Response) {
  const { id } = req.params;

  const item = await prisma.inventory.findFirst({
    where: { id },
    include: { vehicle: true },
  });

  if (!item) {
    return res.status(404).json({ code: "NOT_FOUND", message: "Inventory item not found" });
  }

  if (item.source === "PRIVATE_SELLER" && item.verificationStatus !== "APPROVED") {
    return res.status(404).json({ code: "NOT_FOUND", message: "Inventory item not found" });
  }

  return res.json({ data: toInventory(item), error: null });
}

export async function create(req: Request, res: Response) {
  const body = req.body as CreateInventoryInput;
  const user = req.user;
  if (!user) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  }
  if (body.source === "COMPANY" && !isDealerStaffRole(user.role)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Only staff can add company inventory" });
  }

  const vehicle = await prisma.vehicle.findFirst({ where: { id: body.vehicleId } });
  if (!vehicle) {
    return res.status(400).json({ code: "BAD_REQUEST", message: "Vehicle not found" });
  }

  const inventory = await prisma.inventory.create({
    data: {
      tenant: { connect: { id: req.tenantId! } },
      source: body.source,
      vehicle: { connect: { id: body.vehicleId } },
      ...(body.source === "PRIVATE_SELLER" ? { listedBy: { connect: { id: user.userId } } } : {}),
      location: body.location ?? null,
      listPrice: body.listPrice,
      mileage: body.mileage ?? null,
      vin: body.vin ?? null,
      verificationStatus: body.source === "PRIVATE_SELLER" ? "PENDING" : null,
      imageUrls: optionalJson(body.imageUrls),
      specs: optionalJson(body.specs),
      modelGlbUrl: body.modelGlbUrl ?? null,
      modelSource: body.modelSource ?? null,
      modelSourcePhotoIds: optionalJson(body.modelSourcePhotoIds),
    },
    include: { vehicle: true },
  });

  return res.status(201).json({ data: toInventory(inventory), error: null });
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const body = req.body as UpdateInventoryInput;
  const user = req.user;

  const existing = await prisma.inventory.findFirst({ where: { id } });
  if (!existing) {
    return res.status(404).json({ code: "NOT_FOUND", message: "Inventory item not found" });
  }

  const isStaff = user && isDealerStaffRole(user.role);
  const isOwner = user && existing.listedByUserId === user.userId;
  if (!isStaff && !isOwner) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Not allowed to update this listing" });
  }

  if (isOwner && !isStaff) {
    if (body.verificationStatus !== undefined || body.status !== undefined) {
      return res.status(403).json({ code: "FORBIDDEN", message: "Only staff can change status or verification" });
    }
  }

  const updated = await prisma.inventory.updateMany({
    where: { id, tenantId: req.tenantId! },
    data: {
      ...(body.location !== undefined && { location: body.location }),
      ...(body.listPrice !== undefined && { listPrice: body.listPrice }),
      ...(body.mileage !== undefined && { mileage: body.mileage }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.vin !== undefined && { vin: body.vin }),
      ...(body.verificationStatus !== undefined && { verificationStatus: body.verificationStatus }),
      ...(body.imageUrls !== undefined && {
        imageUrls: body.imageUrls === null ? Prisma.JsonNull : (body.imageUrls as Prisma.InputJsonValue),
      }),
      ...(body.specs !== undefined && {
        specs: body.specs === null ? Prisma.JsonNull : (body.specs as Prisma.InputJsonValue),
      }),
      ...(body.modelGlbUrl !== undefined && { modelGlbUrl: body.modelGlbUrl }),
      ...(body.modelSource !== undefined && { modelSource: body.modelSource }),
      ...(body.modelSourcePhotoIds !== undefined && {
        modelSourcePhotoIds:
          body.modelSourcePhotoIds === null
            ? Prisma.JsonNull
            : (body.modelSourcePhotoIds as Prisma.InputJsonValue),
      }),
    },
  });
  if (updated.count === 0) return res.status(404).json({ code: "NOT_FOUND", message: "Inventory item not found" });

  const inventory = await prisma.inventory.findFirst({
    where: { id, tenantId: req.tenantId! },
    include: { vehicle: true },
  });
  if (!inventory) return res.status(404).json({ code: "NOT_FOUND", message: "Inventory item not found" });

  return res.json({ data: toInventory(inventory), error: null });
}

export async function remove(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  if (!isDealerStaffRole(user.role)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Staff or admin required" });
  }
  const { id } = req.params;
  const deleted = await prisma.inventory.deleteMany({ where: { id } });
  if (deleted.count === 0) return res.status(404).json({ code: "NOT_FOUND", message: "Inventory item not found" });
  return res.json({ data: { id }, error: null });
}
