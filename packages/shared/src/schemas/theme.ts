import { z } from "zod";

/** CSS variable overrides for white-label tenant branding (optional keys). */
export const tenantThemeJsonSchema = z
  .object({
    accent: z.string().optional(),
    accentSecondary: z.string().optional(),
    accentSoft: z.string().optional(),
    bgPrimary: z.string().optional(),
    bgSecondary: z.string().optional(),
    bgCard: z.string().optional(),
    bgCardStrong: z.string().optional(),
    textPrimary: z.string().optional(),
    textSecondary: z.string().optional(),
    textMuted: z.string().optional(),
    line: z.string().optional(),
    lineSoft: z.string().optional(),
    shadowStrong: z.string().optional(),
  })
  .passthrough();

export type TenantThemeJson = z.infer<typeof tenantThemeJsonSchema>;
