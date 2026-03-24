import * as THREE from "three";
import type { WebGLRenderer } from "three";

/** Filmic tone mapping + soft shadows — call from R3F Canvas `onCreated`. */
export function configureVexRenderer(gl: WebGLRenderer): void {
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.08;
  gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  gl.shadowMap.autoUpdate = true;
}
