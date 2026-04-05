import { z } from "zod";

/** Request body for `POST /dms/sync` — `tenantId` comes from auth context only. */
export const dmsSyncApiBodySchema = z.object({
  vendor: z.enum(["vauto", "dealertrack", "cdk", "cargurus"]),
  mode: z.enum(["full", "delta"]).optional(),
});

export const dmsSyncInputSchema = z.object({
  tenantId: z.string(),
  vendor: z.enum(["vauto", "dealertrack", "cdk", "cargurus"]),
  mode: z.enum(["full", "delta"]).default("delta"),
});

export const inventoryImportSchema = z.object({
  externalId: z.string(),
  vin: z.string().min(6),
  make: z.string(),
  model: z.string(),
  year: z.number().int(),
  mileage: z.number().int().nonnegative().optional(),
  listPrice: z.number().nonnegative().optional(),
});

export const dmsSyncOutputSchema = z.object({
  vendor: z.enum(["vauto", "dealertrack", "cdk", "cargurus"]),
  imported: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  lastSyncAt: z.date(),
});
