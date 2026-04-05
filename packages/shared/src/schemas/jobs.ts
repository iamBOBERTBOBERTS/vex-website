import { z } from "zod";

/** BullMQ job names — tenant-scoped, idempotent handlers in API worker. */
export const jobNameSchema = z.enum([
  "appraisal-pdf-generate",
  "valuation-cache-warm",
  "stripe-sync",
  "analytics-rollup",
  "provision-tenant",
  /** Apex Studio — 360 / video spin export (worker stub → real renderer). */
  "apex-studio-360-export",
]);

export type JobName = z.infer<typeof jobNameSchema>;

export const appraisalPdfGenerateJobSchema = z.object({
  tenantId: z.string(),
  appraisalId: z.string(),
  requestedByUserId: z.string().optional(),
});

export const valuationCacheWarmJobSchema = z.object({
  tenantId: z.string(),
  cacheKeyHint: z.string().optional(),
});

export const stripeSyncJobSchema = z.object({
  tenantId: z.string(),
  stripeCustomerId: z.string().optional(),
});

export const analyticsRollupJobSchema = z.object({
  tenantId: z.string(),
  window: z.enum(["hour", "day"]).default("day"),
});

export const provisionTenantJobSchema = z.object({
  tenantId: z.string(),
  tier: z.string(),
  email: z.string().email(),
});

export const jobPayloadSchema = z.discriminatedUnion("name", [
  z.object({
    name: z.literal("appraisal-pdf-generate"),
    tenantId: z.string(),
    appraisalId: z.string(),
    requestedByUserId: z.string().optional(),
  }),
  z.object({
    name: z.literal("valuation-cache-warm"),
    tenantId: z.string(),
    cacheKeyHint: z.string().optional(),
  }),
  z.object({
    name: z.literal("stripe-sync"),
    tenantId: z.string(),
    stripeCustomerId: z.string().optional(),
  }),
  z.object({
    name: z.literal("analytics-rollup"),
    tenantId: z.string(),
    window: z.enum(["hour", "day"]).default("day"),
  }),
  z.object({
    name: z.literal("provision-tenant"),
    tenantId: z.string(),
    tier: z.string(),
    email: z.string().email(),
  }),
  z.object({
    name: z.literal("apex-studio-360-export"),
    tenantId: z.string(),
    buildSnapshotId: z.string(),
    format: z.enum(["gif", "mp4"]).optional(),
  }),
]);

export type JobEnvelope = z.infer<typeof jobPayloadSchema>;
