/**
 * @vex/3d-configurator — phased delivery.
 * Public exports stay minimal until VehicleCanvas + materials land.
 */

export const VEX_3D_CONFIGURATOR_VERSION = "0.1.0";

/** Hook for apps/web to branch WebGL vs static fallback (prefers-reduced-motion, unsupported WebGL). */
export function shouldUseWebGL(): boolean {
  if (typeof window === "undefined") return true;
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mq.matches) return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
