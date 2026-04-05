/**
 * @vex/3d-configurator — phased delivery.
 * Public exports stay minimal until VehicleCanvas + materials land.
 */

export const VEX_3D_CONFIGURATOR_VERSION = "0.1.0";

/** Documented perf targets for hero + configurator R3F scenes (enforcement = Chrome Performance + manual review). */
export const VEX_WEBGL_PERF = {
  /** Target max draw calls per frame after batching (instancing, merged meshes). */
  targetMaxDrawCalls: 100,
  /** Particle systems: cap total points before LOD / throttle. */
  targetMaxParticlePoints: 512,
  /** Prefer WebGL2; WebGPU is progressive enhancement (see `probeWebGPU`). */
  preferWebGL2: true,
} as const;

/**
 * Instancing / batching targets (hero fleet, inventory mini-previews) — enforce in Chrome Performance.
 * Single-mesh GLB + `THREE.InstancedMesh` for repeated bodies; particles = one `THREE.Points` + drawRange LOD.
 */
export const VEX_INSTANCING_SPEC = {
  /** Max instanced exotic bodies visible at full detail before LOD swap. */
  heroFleetInstancesFull: 4,
  /** Grid preview: prefer one shared geometry + instanced transforms. */
  inventoryPreviewMaxDrawn: 12,
} as const;

/** Particle counts per context; all values ≤ `VEX_WEBGL_PERF.targetMaxParticlePoints`. */
export const VEX_PARTICLE_LOD_BUDGETS = {
  backgroundOrHidden: 128,
  narrowMobile: 256,
  tablet: 320,
  desktop: 512,
} as const;

/** Runtime particle budget for `ParticleVortex` (tab visibility + viewport width). SSR: full cap. */
export function resolveParticlePointBudget(): number {
  const cap = VEX_WEBGL_PERF.targetMaxParticlePoints;
  if (typeof window === "undefined") return cap;
  if (typeof document !== "undefined" && document.hidden) {
    return Math.min(VEX_PARTICLE_LOD_BUDGETS.backgroundOrHidden, cap);
  }
  const w = window.innerWidth;
  if (w < 480) return Math.min(VEX_PARTICLE_LOD_BUDGETS.narrowMobile, cap);
  if (w < 1024) return Math.min(VEX_PARTICLE_LOD_BUDGETS.tablet, cap);
  return Math.min(VEX_PARTICLE_LOD_BUDGETS.desktop, cap);
}

/** Sync probe: WebGL2 or WebGL1 context creation (client only). */
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

/**
 * Optional progressive enhancement — does not replace WebGL2 path today.
 * Call from client after user gesture or idle if you need to branch materials.
 */
export async function probeWebGPU(): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
  if (!gpu?.requestAdapter) return false;
  try {
    const adapter = await gpu.requestAdapter();
    return adapter != null;
  } catch {
    return false;
  }
}
