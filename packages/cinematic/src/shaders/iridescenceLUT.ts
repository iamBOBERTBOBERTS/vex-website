import * as THREE from "three";

/** 1×256 RGB spectral strip — mixed with analytic thin-film in fragment (lookup fallback). */
export function createIridescenceLUTTexture(): THREE.DataTexture {
  const w = 256;
  const data = new Uint8Array(w * 4);
  for (let i = 0; i < w; i++) {
    const t = i / (w - 1);
    const r = 0.5 + 0.5 * Math.cos(t * Math.PI * 2);
    const g = 0.5 + 0.5 * Math.cos(t * Math.PI * 2 + (2 * Math.PI) / 3);
    const b = 0.5 + 0.5 * Math.cos(t * Math.PI * 2 + (4 * Math.PI) / 3);
    const o = i * 4;
    data[o] = Math.floor(THREE.MathUtils.clamp(r, 0, 1) * 255);
    data[o + 1] = Math.floor(THREE.MathUtils.clamp(g, 0, 1) * 255);
    data[o + 2] = Math.floor(THREE.MathUtils.clamp(b, 0, 1) * 255);
    data[o + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}
