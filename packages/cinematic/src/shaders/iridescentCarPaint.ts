import * as THREE from "three";
import { ANISOTROPIC_CHROME_LAYER } from "./AnisotropicChromeGLSL.js";
import { IRIDESCENT_PAINT_LAYER } from "./IridescentPaintGLSL.js";
import { METALLIC_FLAKE_LAYER, METALLIC_FLAKE_NOISE_HELPERS } from "./MetallicFlakeLayer.js";
import { MULTI_LAYER_CLEAR_COAT } from "./MultiLayerClearCoat.js";
import type { CinematicPaintUniforms } from "./types.js";

export type CinematicLuxuryPaintOptions = {
  accentHex?: string;
  iridescence?: number;
  uniforms?: Partial<CinematicPaintUniforms>;
};

const UNIFORM_DECL = /* glsl */ `
uniform float uCinematicTime;
uniform float uFlakeDensity;
uniform float uIridescenceStrength;
uniform float uClearCoatIntensity;
uniform float uAnisotropicChrome;
uniform float uIridescenceAngle;
uniform float uClearCoatRefraction;
uniform float uAnisotropyStrength;
uniform vec2 uMouseInfluence;
`;

/** Advanced GLSL body: iridescent thin-film + procedural flake + multi-layer clear-coat. */
const BODY_INJECT = /* glsl */ `
{
${IRIDESCENT_PAINT_LAYER}
${METALLIC_FLAKE_LAYER}
${MULTI_LAYER_CLEAR_COAT}
}
`;

/** Chrome / wheels: anisotropic-style highlights. */
const CHROME_INJECT = /* glsl */ `
{
${ANISOTROPIC_CHROME_LAYER}
}
`;

function patchOutputFragment(shader: { fragmentShader: string }, inject: string): void {
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <output_fragment>",
    `${inject}
#include <output_fragment>`
  );
}

function injectGlslPreamble(shader: { fragmentShader: string }): void {
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <common>",
    `#include <common>
${UNIFORM_DECL}
${METALLIC_FLAKE_NOISE_HELPERS}
`
  );
}

function attachCinematicUniforms(
  shader: { uniforms: Record<string, THREE.IUniform> },
  sharedTime: THREE.IUniform<number>,
  sharedMouse: THREE.IUniform<THREE.Vector2>,
  u: CinematicPaintUniforms
): void {
  shader.uniforms.uCinematicTime = sharedTime;
  shader.uniforms.uMouseInfluence = sharedMouse;
  shader.uniforms.uFlakeDensity = { value: u.flakeDensity };
  shader.uniforms.uIridescenceStrength = { value: u.iridescenceStrength };
  shader.uniforms.uClearCoatIntensity = { value: u.clearCoatIntensity };
  shader.uniforms.uAnisotropicChrome = { value: u.anisotropicChrome };
  shader.uniforms.uIridescenceAngle = { value: u.iridescenceAngle };
  shader.uniforms.uClearCoatRefraction = { value: u.clearCoatRefraction };
  shader.uniforms.uAnisotropyStrength = { value: u.anisotropyStrength };
}

/**
 * MeshPhysicalMaterial + onBeforeCompile: modular GLSL layers (WebGL2).
 * Re-exported building blocks: `IridescentPaintGLSL`, `MetallicFlakeLayer`, `MultiLayerClearCoat`, `AnisotropicChromeGLSL`.
 */
export function patchBodyPhysicalMaterial(
  phys: THREE.MeshPhysicalMaterial,
  sharedTime: THREE.IUniform<number>,
  sharedMouse: THREE.IUniform<THREE.Vector2>,
  uniforms: CinematicPaintUniforms
): void {
  phys.onBeforeCompile = (shader) => {
    injectGlslPreamble(shader);
    attachCinematicUniforms(shader, sharedTime, sharedMouse, uniforms);
    patchOutputFragment(shader, BODY_INJECT);
  };
  phys.needsUpdate = true;
}

export function patchChromePhysicalMaterial(
  phys: THREE.MeshPhysicalMaterial,
  sharedTime: THREE.IUniform<number>,
  sharedMouse: THREE.IUniform<THREE.Vector2>,
  uniforms: CinematicPaintUniforms
): void {
  phys.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>
${UNIFORM_DECL}
`
    );
    attachCinematicUniforms(shader, sharedTime, sharedMouse, uniforms);
    patchOutputFragment(shader, CHROME_INJECT);
  };
  phys.needsUpdate = true;
}
