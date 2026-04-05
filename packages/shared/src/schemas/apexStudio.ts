import { z } from "zod";

/**
 * Hierarchical part categories for Apex Studio UI + future dependency rules
 * (Exterior → Wheels → Brakes, etc.).
 */
export const apexStudioPartCategorySchema = z.enum([
  "exterior",
  "wheels",
  "tires",
  "brakes",
  "interior",
  "performance",
  "aero",
]);

export type ApexStudioPartCategory = z.infer<typeof apexStudioPartCategorySchema>;

/** Serializable build snapshot — CRM handoff, share links, export jobs (tenant-scoped on server). */
export const apexStudioBuildSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  vehicleId: z.string().nullable(),
  inventoryId: z.string().nullable(),
  finishId: z.string(),
  edition: z.string(),
  powertrain: z.string(),
  selectedOptions: z.record(z.string(), z.string()),
  totalPriceUsd: z.number().nonnegative().optional(),
});

export type ApexStudioBuildSnapshot = z.infer<typeof apexStudioBuildSnapshotSchema>;

/** Future: wheel → brake conflicts validated server-side before checkout. */
export const apexStudioPartDependencyRuleSchema = z.object({
  id: z.string(),
  ifPartId: z.string(),
  requiresOneOf: z.array(z.string()).min(1),
  message: z.string(),
});

export type ApexStudioPartDependencyRule = z.infer<typeof apexStudioPartDependencyRuleSchema>;
