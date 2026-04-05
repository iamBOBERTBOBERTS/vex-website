import { z } from "zod";

/** White-label 3D surfaces: hero GLB, HDRI preset, accent paint — merge with tenant CSS vars on the client. */
export const heroEnvironmentPresetSchema = z.enum(["city", "studio", "night", "sunset", "dawn", "warehouse"]);

export type HeroEnvironmentPreset = z.infer<typeof heroEnvironmentPresetSchema>;

export const TenantCinematic3dSchema = z.object({
  tenantSlug: z.string().min(1).max(96).optional(),
  glbUrl: z.string().url().optional(),
  heroEnvPreset: heroEnvironmentPresetSchema.optional(),
  logoUrl: z.string().url().optional(),
  /** Sheen / iridescence tint — e.g. from `--accent-bright` */
  heroPaintAccentHex: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/)
    .optional(),
  /** @vex/cinematic shader uniforms (white-label) */
  flakeDensity: z.number().min(0).max(2).optional(),
  iridescenceStrength: z.number().min(0).max(2).optional(),
  clearCoatIntensity: z.number().min(0).max(3).optional(),
  anisotropicChrome: z.number().min(0).max(2).optional(),
  iridescenceAngle: z.number().min(0).max(3).optional(),
  clearCoatRefraction: z.number().min(0).max(2).optional(),
  anisotropyStrength: z.number().min(0).max(2).optional(),
  iridescenceLUTBlend: z.number().min(0).max(1).optional(),
});

export type TenantCinematic3d = z.infer<typeof TenantCinematic3dSchema>;
