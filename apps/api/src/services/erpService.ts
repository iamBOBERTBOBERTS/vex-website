import type { PrismaClient } from "@prisma/client";
import { OrderStatus, OrderType } from "@prisma/client";
import { DEALER_AUDIT_SCHEMA_VERSION, newDealerCorrelationId } from "../lib/dealerAudit.js";
import { addAppraisalToInventory } from "./dealDeskService.js";

type CreateErpOrderInput = {
  tenantId: string;
  appraisalId: string;
  actorUserId: string;
  listPrice?: number;
  location?: string | null;
};

type ErpOrderRecord = {
  id: string;
  appraisalId: string;
  inventoryId: string | null;
  vehicleId: string | null;
  status: string;
  totalAmount: number | null;
  createdAt: Date;
};

type ErpInvoiceRecord = {
  invoiceNumber: string;
  orderId: string;
  appraisalId: string;
  status: string;
  amountUsd: number | null;
  issuedAt: Date;
};

function invoiceNumberForOrder(orderId: string): string {
  return `INV-${orderId.slice(0, 8).toUpperCase()}`;
}

function toInvoice(order: ErpOrderRecord): ErpInvoiceRecord {
  return {
    invoiceNumber: invoiceNumberForOrder(order.id),
    orderId: order.id,
    appraisalId: order.appraisalId,
    status: order.status,
    amountUsd: order.totalAmount,
    issuedAt: order.createdAt,
  };
}

async function resolveOrderUserId(prisma: PrismaClient, tenantId: string, appraisalId: string): Promise<string | null> {
  const appraisal = await prisma.appraisal.findFirst({
    where: { id: appraisalId, tenantId },
    include: { customer: { select: { userId: true } } },
  });
  if (appraisal?.customer?.userId) return appraisal.customer.userId;

  const fallback = await prisma.user.findFirst({
    where: { tenantId, role: { in: ["ADMIN", "GROUP_ADMIN", "STAFF"] } },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return fallback?.id ?? null;
}

export async function createErpOrderFromAppraisal(prisma: PrismaClient, input: CreateErpOrderInput) {
  const appraisal = await prisma.appraisal.findFirst({
    where: { id: input.appraisalId, tenantId: input.tenantId },
    select: { id: true, value: true },
  });
  if (!appraisal) throw new Error("APPRAISAL_NOT_FOUND");

  const inventory = await addAppraisalToInventory(prisma, {
    tenantId: input.tenantId,
    appraisalId: input.appraisalId,
    actorUserId: input.actorUserId,
    listPrice: input.listPrice ?? Number(appraisal.value ?? 0),
    location: input.location,
  });

  const existing = await prisma.order.findFirst({
    where: {
      tenantId: input.tenantId,
      inventoryId: inventory.id,
      type: OrderType.INVENTORY,
    },
    select: {
      id: true,
      inventoryId: true,
      vehicleId: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      financingSnapshot: true,
    },
  });

  let order: ErpOrderRecord;
  if (existing) {
    const existingAppraisalId = (existing.financingSnapshot as { appraisalId?: string } | null)?.appraisalId;
    order = {
      id: existing.id,
      appraisalId: existingAppraisalId ?? input.appraisalId,
      inventoryId: existing.inventoryId,
      vehicleId: existing.vehicleId,
      status: existing.status,
      totalAmount: existing.totalAmount != null ? Number(existing.totalAmount) : null,
      createdAt: existing.createdAt,
    };
  } else {
    const erpCorrelationId = newDealerCorrelationId();
    const orderUserId = await resolveOrderUserId(prisma, input.tenantId, input.appraisalId);
    if (!orderUserId) throw new Error("ORDER_USER_NOT_FOUND");

    const created = await prisma.order.create({
      data: {
        tenantId: input.tenantId,
        userId: orderUserId,
        type: OrderType.INVENTORY,
        inventoryId: inventory.id,
        vehicleId: inventory.vehicleId,
        status: OrderStatus.CONFIRMED,
        totalAmount: Number(appraisal.value ?? 0),
        financingSnapshot: {
          source: "erp",
          appraisalId: input.appraisalId,
        },
      },
      select: {
        id: true,
        inventoryId: true,
        vehicleId: true,
        status: true,
        totalAmount: true,
        createdAt: true,
      },
    });

    order = {
      id: created.id,
      appraisalId: input.appraisalId,
      inventoryId: created.inventoryId,
      vehicleId: created.vehicleId,
      status: created.status,
      totalAmount: created.totalAmount != null ? Number(created.totalAmount) : null,
      createdAt: created.createdAt,
    };

    /** Parallel writes on the same client/transaction — no nested `$transaction` (caller may wrap whole close in one interactive transaction). */
    await Promise.all([
      prisma.usageLog.create({
        data: {
          tenantId: input.tenantId,
          kind: "erp_order_create",
          quantity: 1,
          amountUsd: Number(appraisal.value ?? 0),
          meta: {
            appraisalId: input.appraisalId,
            orderId: created.id,
            inventoryId: inventory.id,
          },
        },
      }),
      prisma.eventLog.create({
        data: {
          tenantId: input.tenantId,
          type: "RevenueEvent",
          payload: {
            source: "erp_order_create",
            correlationId: erpCorrelationId,
            schemaVersion: DEALER_AUDIT_SCHEMA_VERSION,
            appraisalId: input.appraisalId,
            orderId: created.id,
            inventoryId: inventory.id,
            amountUsd: Number(appraisal.value ?? 0),
            actorUserId: input.actorUserId,
          },
        },
      }),
      prisma.eventLog.create({
        data: {
          tenantId: input.tenantId,
          type: "erp.invoice.issued",
          payload: {
            correlationId: erpCorrelationId,
            appraisalId: input.appraisalId,
            orderId: created.id,
            invoiceNumber: invoiceNumberForOrder(created.id),
            amountUsd: Number(appraisal.value ?? 0),
          },
        },
      }),
      prisma.auditLog.create({
        data: {
          tenantId: input.tenantId,
          actorId: input.actorUserId,
          action: "ERP_ORDER_CREATE",
          entity: "Order",
          entityId: created.id,
          payload: {
            correlationId: erpCorrelationId,
            schemaVersion: DEALER_AUDIT_SCHEMA_VERSION,
            integrationSurface: "erp",
            appraisalId: input.appraisalId,
            inventoryId: inventory.id,
            invoiceNumber: invoiceNumberForOrder(created.id),
          },
        },
      }),
    ]);
  }

  return {
    order,
    invoice: toInvoice(order),
    inventoryId: inventory.id,
  };
}

export async function listErpOrders(prisma: PrismaClient, tenantId: string): Promise<ErpOrderRecord[]> {
  const rows = await prisma.order.findMany({
    where: {
      tenantId,
      financingSnapshot: {
        path: ["source"],
        equals: "erp",
      },
    },
    select: {
      id: true,
      inventoryId: true,
      vehicleId: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      financingSnapshot: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    appraisalId:
      (row.financingSnapshot as { appraisalId?: string } | null)?.appraisalId ?? "unknown",
    inventoryId: row.inventoryId,
    vehicleId: row.vehicleId,
    status: row.status,
    totalAmount: row.totalAmount != null ? Number(row.totalAmount) : null,
    createdAt: row.createdAt,
  }));
}

export async function listErpInvoices(prisma: PrismaClient, tenantId: string): Promise<ErpInvoiceRecord[]> {
  const orders = await listErpOrders(prisma, tenantId);
  return orders.map(toInvoice);
}

/** Alias for pilot docs / integrations that refer to `createOrderFromAppraisal`. */
export const createOrderFromAppraisal = createErpOrderFromAppraisal;
