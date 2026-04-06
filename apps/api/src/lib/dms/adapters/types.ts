export type DmsVendor = "dealertrack";

export type DmsSyncMode = "full" | "delta";

export type DmsInventoryRecord = {
  externalId: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  mileage?: number;
  listPrice?: number;
};

export type DmsInventorySyncResult = {
  /** Raw inventory records (adapter-only). Later: normalize → upsert → return counts. */
  records: DmsInventoryRecord[];
  imported: number;
  skipped: number;
  lastSyncAt: Date;
};

export type DmsSyncContext = {
  tenantId: string;
  mode: DmsSyncMode;
};

export type DmsAdapter = {
  vendor: DmsVendor;
  fetchInventoryFull: () => Promise<DmsInventoryRecord[]>;
  fetchInventoryDelta: () => Promise<DmsInventoryRecord[]>;
  syncInventory: (ctx: DmsSyncContext) => Promise<DmsInventorySyncResult>;
};

