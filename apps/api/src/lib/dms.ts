import { dmsSyncInputSchema, dmsSyncOutputSchema } from "@vex/shared";
import { prisma } from "./tenant.js";
import { dmsAdaptersByVendor } from "./dms/adapters/index.js";
import type { DmsAdapter } from "./dms/adapters/types.js";

const vendorWindow = new Map<string, { minute: string; count: number }>();
const spendWindow = new Map<string, { month: string; usd: number }>();

function vendorKey(tenantId: string, vendor: string) {
  return `${tenantId}:${vendor}`;
}

function allowVendorRate(tenantId: string, vendor: string): boolean {
  const minute = new Date().toISOString().slice(0, 16);
  const key = vendorKey(tenantId, vendor);
  const row = vendorWindow.get(key);
  if (!row || row.minute !== minute) {
    vendorWindow.set(key, { minute, count: 1 });
    return true;
  }
  if (row.count >= 100) return false;
  row.count += 1;
  vendorWindow.set(key, row);
  return true;
}

function addSpend(tenantId: string, usd: number): boolean {
  const month = new Date().toISOString().slice(0, 7);
  const row = spendWindow.get(tenantId);
  if (!row || row.month !== month) {
    spendWindow.set(tenantId, { month, usd });
    return true;
  }
  if (row.usd + usd > 10) return false;
  row.usd += usd;
  spendWindow.set(tenantId, row);
  return true;
}

const ADAPTERS: Record<string, DmsAdapter> = {
  ...dmsAdaptersByVendor,
};

function resolveAdapter(vendor: string): DmsAdapter {
  const adapter = ADAPTERS[vendor];
  if (!adapter) throw new Error(`Unsupported DMS vendor: ${vendor}`);
  return adapter;
}

export class DMSService {
  async sync(inputRaw: unknown) {
    const input = dmsSyncInputSchema.parse(inputRaw);
    if (!allowVendorRate(input.tenantId, input.vendor)) {
      return { imported: 0, skipped: 0, lastSyncAt: new Date(), vendor: input.vendor };
    }
    if (!addSpend(input.tenantId, 0.05)) {
      throw new Error("DMS monthly spend cap exceeded");
    }

    const adapter = resolveAdapter(input.vendor);
    const result = await adapter.syncInventory({ tenantId: input.tenantId, mode: input.mode });
    // Skeleton: upsert records into Inventory/Vehicle tables in a follow-up PR.
    // For now we only return counts and keep raw records inside adapter result.

    await prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        action: "DMS_SYNC",
        entity: "DMS",
        payload: { vendor: input.vendor, mode: input.mode, imported: result.imported, skipped: result.skipped },
      },
    });
    await prisma.usageLog.create({
      data: {
        tenantId: input.tenantId,
        kind: "DMS_SYNC",
        quantity: result.imported,
        amountUsd: 0.05,
        meta: { vendor: input.vendor },
      },
    });
    return dmsSyncOutputSchema.parse({
      vendor: input.vendor,
      imported: result.imported,
      skipped: result.skipped,
      lastSyncAt: result.lastSyncAt,
    });
  }
}
