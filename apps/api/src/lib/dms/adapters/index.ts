import { DealertrackAdapter } from "./dealertrackAdapter.js";
import type { DmsAdapter, DmsVendor } from "./types.js";

export const dealertrackAdapter: DmsAdapter = new DealertrackAdapter();

export const dmsAdaptersByVendor: Record<DmsVendor, DmsAdapter> = {
  dealertrack: dealertrackAdapter,
};

