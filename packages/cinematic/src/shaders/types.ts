/** Live uniforms for hero / configurator / tenant JSON → runtime. */
export type CinematicPaintUniforms = {
  flakeDensity: number;
  iridescenceStrength: number;
  clearCoatIntensity: number;
  anisotropicChrome: number;
  /** Thin-film phase scale — pseudo optical thickness (Belcour-style path) */
  iridescenceAngle: number;
  /** Secondary clear-coat refraction / env blend (0–1) */
  clearCoatRefraction: number;
  /** Scales tangent-space anisotropic chrome lobes (wheels / trim) */
  anisotropyStrength: number;
  /** Mix analytic thin-film vs 1D spectral LUT (0 = analytic only, 1 = full LUT) */
  iridescenceLUTBlend: number;
};

export const DEFAULT_CINEMATIC_UNIFORMS: CinematicPaintUniforms = {
  flakeDensity: 0.85,
  iridescenceStrength: 0.55,
  clearCoatIntensity: 1,
  anisotropicChrome: 0.72,
  iridescenceAngle: 1,
  clearCoatRefraction: 0.55,
  anisotropyStrength: 1,
  iridescenceLUTBlend: 0.38,
};
