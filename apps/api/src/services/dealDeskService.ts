import type { PrismaClient } from "@prisma/client";
import { InventorySource } from "@prisma/client";

type DealDeskStatus = "OPEN" | "ACCEPTED" | "REJECTED" | "NEGOTIATING" | "CLOSED";

type DealDeskUpdateInput = {
  tenantId: string;
  appraisalId: string;
  status: DealDeskStatus;
  note?: string | null;
  actorUserId: string;
};

type AddToInventoryInput = {
  tenantId: string;
  appraisalId: string;
  actorUserId: string;
  listPrice?: number;
  location?: string | null;
};

function parseVehicleFromNotes(notes: string | null): { make: string; model: string; year: number } | null {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes) as { make?: string; model?: string; year?: number };
    if (!parsed.make || !parsed.model || !parsed.year) return null;
    return {
      make: parsed.make,
      model: parsed.model,
      year: parsed.year,
    };
  } catch {
    return null;
  }
}

async function ensureInventoryForAppraisal(prisma: PrismaClient, input: AddToInventoryInput) {
  const appraisal = await prisma.appraisal.findFirst({
    where: { id: input.appraisalId, tenantId: input.tenantId },
    include: {
      vehicle: true,
    },
  });
  if (!appraisal) {
    throw new Error("APPRAISAL_NOT_FOUND");
  }

  const existingInventory = await prisma.inventory.findFirst({
    where: {
      tenantId: input.tenantId,
      source: InventorySource.APPRAISAL,
      vehicleId: appraisal.vehicleId ?? undefined,
      specs: {
        path: ["appraisalId"],
        equals: input.appraisalId,
      },
    },
  });
  if (existingInventory) return existingInventory;

  let vehicleId = appraisal.vehicleId;
  if (!vehicleId) {
    const fromNotes = parseVehicleFromNotes(appraisal.notes);
    const createdVehicle = await prisma.vehicle.create({
      data: {
        tenantId: input.tenantId,
        make: fromNotes?.make ?? "Unknown",
        model: fromNotes?.model ?? "Appraisal",
        trimLevel: "Appraisal",
        year: fromNotes?.year ?? new Date().getUTCFullYear(),
        basePrice: Number(appraisal.value ?? 0),
        bodyType: "UNKNOWN",
        isActive: true,
      },
      select: { id: true },
    });
    vehicleId = createdVehicle.id;
    await prisma.appraisal.updateMany({
      where: { id: input.appraisalId, tenantId: input.tenantId },
      data: { vehicleId },
    });
  }

  return prisma.inventory.create({
    data: {
      tenantId: input.tenantId,
      source: InventorySource.APPRAISAL,
      vehicleId: vehicleId!,
      listedByUserId: input.actorUserId,
      location: input.location ?? "Deal Desk Intake",
      listPrice: input.listPrice ?? Number(appraisal.value ?? 0),
      mileage: null,
      status: "AVAILABLE",
      specs: {
        appraisalId: input.appraisalId,
        appraisalSourced: true,
      },
    },
  });
}

export async function addAppraisalToInventory(prisma: PrismaClient, input: AddToInventoryInput) {
  return ensureInventoryForAppraisal(prisma, input);
}

export async function updateDealDeskStatus(prisma: PrismaClient, input: DealDeskUpdateInput) {
  const appraisal = await prisma.appraisal.findFirst({
    where: { id: input.appraisalId, tenantId: input.tenantId },
    select: { id: true, value: true },
  });
  if (!appraisal) {
    throw new Error("APPRAISAL_NOT_FOUND");
  }

  const normalizedStatus = input.status.toLowerCase();
  const isClosed = input.status === "CLOSED";

  let inventoryId: string | null = null;
  let orderId: string | null = null;
  let invoiceNumber: string | null = null;

  const deskWrites = (tx: PrismaClient) => [
    tx.appraisal.updateMany({
      where: { id: input.appraisalId, tenantId: input.tenantId },
      data: { status: normalizedStatus },
    }),
    tx.eventLog.create({
      data: {
        tenantId: input.tenantId,
        type: "deal_desk.updated",
        payload: {
          appraisalId: input.appraisalId,
          status: input.status,
          note: input.note ?? null,
          actorUserId: input.actorUserId,
        },
      },
    }),
    tx.auditLog.create({
      data: {
        tenantId: input.tenantId,
        actorId: input.actorUserId,
        action: "DEAL_DESK_UPDATE",
        entity: "Appraisal",
        entityId: input.appraisalId,
        payload: {
          status: input.status,
          note: input.note ?? null,
          inventoryId,
          orderId,
          invoiceNumber,
        },
      },
    }),
    tx.notification.create({
      data: {
        tenantId: input.tenantId,
        userId: input.actorUserId,
        type: "DEAL_DESK",
        title: "Deal desk updated",
        body: `Appraisal ${input.appraisalId} marked ${input.status}.`,
      },
    }),
  ];

  if (isClosed) {
    /** Single interactive transaction: ERP order + inventory + billing + revenue + ERP audit + appraisal status + deal_desk + DEAL_DESK audit + in-app notification. */
    const { createErpOrderFromAppraisal } = await import("./erpService.js");
    await prisma.$transaction(async (tx) => {
      const erp = await createErpOrderFromAppraisal(tx as unknown as PrismaClient, {
        tenantId: input.tenantId,
        appraisalId: input.appraisalId,
        actorUserId: input.actorUserId,
        listPrice: Number(appraisal.value ?? 0),
      });
      inventoryId = erp.inventoryId;
      orderId = erp.order.id;
      invoiceNumber = erp.invoice.invoiceNumber;
      await Promise.all(deskWrites(tx as unknown as PrismaClient));
    });
  } else {
    await prisma.$transaction(deskWrites(prisma));
  }

  return {
    appraisalId: input.appraisalId,
    status: input.status,
    note: input.note ?? null,
    inventoryId,
    orderId,
    invoiceNumber,
  };
}
