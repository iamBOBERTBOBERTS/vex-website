import { z } from "zod";

export const PilotNetworkMetricsSchema = z.object({
  activePilots: z.number().int().nonnegative(),
  totalPilotAppraisals: z.number().int().nonnegative(),
  firstBillingEvents: z.number().int().nonnegative(),
  publicIntakeToday: z.number().int().nonnegative().optional(),
  closedDealsAcrossPilots: z.number().int().nonnegative().optional(),
  /** Lifetime PUBLIC_APPRAISAL usage events across pilot tenants (public intake funnel) */
  publicQuickAppraisalSubmissionsLifetime: z.number().int().nonnegative().optional(),
  generatedAt: z.string(),
});

export type PilotNetworkMetrics = z.infer<typeof PilotNetworkMetricsSchema>;

export const RaisePackageSchema = z.object({
  generatedAt: z.string(),
  tenantCount: z.number().int().nonnegative(),
  activeTenantCount: z.number().int().nonnegative(),
  mrr: z.number().nonnegative(),
  usageRevenueUsd: z.number().nonnegative(),
  highlights: z.array(z.string()),
  /** Aggregated pilot network metrics (optional — merged for investor deck) */
  pilotNetwork: PilotNetworkMetricsSchema.optional(),
});

export type RaisePackage = z.infer<typeof RaisePackageSchema>;
