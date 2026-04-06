import { dealertrackRequest } from "../../dealertrack.js";
import type { DmsAdapter, DmsInventoryRecord, DmsVendor, DmsSyncContext, DmsInventorySyncResult } from "./types.js";

type DealertrackInventoryVehicle = {
  id?: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  listPrice?: number;
};

function toInventoryRecord(v: DealertrackInventoryVehicle): DmsInventoryRecord | null {
  if (!v.vin || !v.make || !v.model || !v.year) return null;
  return {
    externalId: String(v.id ?? v.vin),
    vin: String(v.vin),
    make: String(v.make),
    model: String(v.model),
    year: Number(v.year),
    mileage: typeof v.mileage === "number" ? v.mileage : undefined,
    listPrice: typeof v.listPrice === "number" ? v.listPrice : undefined,
  };
}

export class DealertrackAdapter implements DmsAdapter {
  readonly vendor: DmsVendor = "dealertrack";

  private readonly client: typeof dealertrackRequest;

  constructor(client: typeof dealertrackRequest = dealertrackRequest) {
    this.client = client;
  }

  async fetchInventoryFull(): Promise<DmsInventoryRecord[]> {
    // Skeleton: endpoint shape may vary by Dealertrack subscription/product.
    // This adapter is intentionally conservative and returns [] on missing fields.
    const vehicles = await this.client<DealertrackInventoryVehicle[]>("GET", "/inventory/vehicles");
    return vehicles.map(toInventoryRecord).filter((v): v is DmsInventoryRecord => v != null);
  }

  async fetchInventoryDelta(): Promise<DmsInventoryRecord[]> {
    // Skeleton delta: use same endpoint until vendor supports cursor/time window.
    return this.fetchInventoryFull();
  }

  async syncInventory(ctx: DmsSyncContext): Promise<DmsInventorySyncResult> {
    const records = ctx.mode === "full" ? await this.fetchInventoryFull() : await this.fetchInventoryDelta();
    return {
      records,
      imported: records.length,
      skipped: 0,
      lastSyncAt: new Date(),
    };
  }
}

