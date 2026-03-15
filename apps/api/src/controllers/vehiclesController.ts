import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function toVehicle(record: {
  id: string;
  make: string;
  model: string;
  trimLevel: string;
  year: number;
  basePrice: { toNumber: () => number };
  bodyType: string | null;
  imageUrls: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: record.id,
    make: record.make,
    model: record.model,
    trimLevel: record.trimLevel,
    year: record.year,
    basePrice: Number(record.basePrice),
    bodyType: record.bodyType,
    imageUrls: record.imageUrls as string[] | null,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toOption(record: {
  id: string;
  vehicleId: string | null;
  category: string;
  name: string;
  priceDelta: { toNumber: () => number };
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: record.id,
    vehicleId: record.vehicleId,
    category: record.category,
    name: record.name,
    priceDelta: Number(record.priceDelta),
    isRequired: record.isRequired,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function list(req: Request, res: Response) {
  const make = req.query.make as string | undefined;
  const isActive = req.query.isActive !== "false";

  const where: { isActive: boolean; make?: string } = { isActive };
  if (make) where.make = make;
  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: [{ make: "asc" }, { model: "asc" }],
  });

  return res.json(vehicles.map(toVehicle));
}

export async function getOptions(req: Request, res: Response) {
  const { id } = req.params;

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    return res.status(404).json({ code: "NOT_FOUND", message: "Vehicle not found" });
  }

  const options = await prisma.configurationOption.findMany({
    where: { OR: [{ vehicleId: id }, { vehicleId: null }] },
  });

  return res.json(options.map(toOption));
}
