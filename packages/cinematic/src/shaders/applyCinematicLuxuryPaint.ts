import * as THREE from "three";
import { createIridescenceLUTTexture } from "./iridescenceLUT.js";
import { DEFAULT_CINEMATIC_UNIFORMS, type CinematicPaintUniforms } from "./types.js";
import type { CinematicLuxuryPaintOptions } from "./iridescentCarPaint.js";
import { patchBodyPhysicalMaterial, patchChromePhysicalMaterial } from "./iridescentCarPaint.js";

const BODY_SKIP =
  /lamp|light|glass|window|ground|shadow|logo|grille|headlight|taillight|interior|seat|mirror/i;
const CHROME_MATCH = /wheel|tire|tyre|rim|chrome|brake/i;

/**
 * Applies luxury PBR + cinematic GLSL patches. Sets `root.userData.__cinematicSharedTime` for `useFrame` ticks.
 */
export function applyCinematicLuxuryPaint(root: THREE.Object3D, opts?: CinematicLuxuryPaintOptions): void {
  const sharedTime: THREE.IUniform<number> = { value: 0 };
  root.userData.__cinematicSharedTime = sharedTime;

  let sharedMouse = root.userData.__cinematicMouse as THREE.IUniform<THREE.Vector2> | undefined;
  if (!sharedMouse) {
    sharedMouse = { value: new THREE.Vector2(0.5, 0.5) };
    root.userData.__cinematicMouse = sharedMouse;
  }

  let lut = root.userData.__cinematicIridescenceLUT as THREE.DataTexture | undefined;
  if (!lut) {
    lut = createIridescenceLUTTexture();
    root.userData.__cinematicIridescenceLUT = lut;
  }

  const u: CinematicPaintUniforms = {
    ...DEFAULT_CINEMATIC_UNIFORMS,
    ...opts?.uniforms,
  };

  const baseIrid = opts?.iridescence ?? 0.52;
  if (opts?.uniforms?.iridescenceStrength == null) {
    u.iridescenceStrength = baseIrid + 0.12;
  }
  if (opts?.uniforms?.iridescenceAngle == null) {
    u.iridescenceAngle = DEFAULT_CINEMATIC_UNIFORMS.iridescenceAngle;
  }

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const name = (mesh.name || "").toLowerCase();
    if (BODY_SKIP.test(name)) return;

    const isChrome = CHROME_MATCH.test(name);
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (let i = 0; i < mats.length; i++) {
      const raw = mats[i];
      if (!raw) continue;

      let phys: THREE.MeshPhysicalMaterial;
      if (raw instanceof THREE.MeshPhysicalMaterial) {
        phys = raw;
      } else if (raw instanceof THREE.MeshStandardMaterial) {
        phys = new THREE.MeshPhysicalMaterial();
        phys.copy(raw);
        if (Array.isArray(mesh.material)) {
          const next = [...mesh.material] as THREE.Material[];
          next[i] = phys;
          mesh.material = next;
        } else {
          mesh.material = phys;
        }
      } else {
        continue;
      }

      const accent = opts?.accentHex ? new THREE.Color(opts.accentHex) : new THREE.Color(0xc9a962);
      phys.color = new THREE.Color(0x121820);
      phys.metalness = THREE.MathUtils.clamp(phys.metalness * 0.9 + (isChrome ? 0.15 : 0.08), 0, 1);
      phys.roughness = THREE.MathUtils.clamp(phys.roughness * (isChrome ? 0.65 : 0.88), 0.04, 1);
      phys.clearcoat = isChrome ? 0.92 : 1;
      phys.clearcoatRoughness = isChrome ? 0.12 : 0.07;
      phys.sheen = isChrome ? 0.45 : 0.78;
      phys.sheenRoughness = 0.38;
      phys.sheenColor = accent;
      phys.iridescence = isChrome ? 0.28 : 0.55;
      phys.iridescenceIOR = 1.34;
      phys.iridescenceThicknessRange = [100, 420];

      if (isChrome) {
        patchChromePhysicalMaterial(phys, sharedTime, sharedMouse, u);
      } else {
        patchBodyPhysicalMaterial(phys, sharedTime, sharedMouse, lut, u);
      }
    }
  });
}
