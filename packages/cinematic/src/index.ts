export { applyCinematicLuxuryPaint } from "./shaders/applyCinematicLuxuryPaint.js";
export type { CinematicLuxuryPaintOptions } from "./shaders/iridescentCarPaint.js";
export {
  patchBodyPhysicalMaterial,
  patchChromePhysicalMaterial,
} from "./shaders/iridescentCarPaint.js";
export type { CinematicPaintUniforms } from "./shaders/types.js";
export { DEFAULT_CINEMATIC_UNIFORMS } from "./shaders/types.js";
export { hasWebGPU } from "./detect.js";
export { WebGPUEngine, type WebGPUEngineProps } from "./WebGPUEngine.js";
export { CinematicPaintTimeTicker } from "./components/CinematicPaintTimeTicker.js";
export { CinematicMouseUniform } from "./components/CinematicMouseUniform.js";
export { VortexCarMaterialGLSL, type VortexCarMaterialGLSLProps } from "./components/VortexCarMaterialGLSL.js";
export { getIridescentTslStub, CINEMATIC_TSL_PHASE } from "./shaders/iridescentCarPaintNode.js";
export { COMPUTE_PARTICLE_PHASE } from "./shaders/computeParticleVortexStub.js";
export { IRIDESCENT_PAINT_LAYER } from "./shaders/IridescentPaintGLSL.js";
export { METALLIC_FLAKE_LAYER, METALLIC_FLAKE_NOISE_HELPERS } from "./shaders/MetallicFlakeLayer.js";
export { MULTI_LAYER_CLEAR_COAT } from "./shaders/MultiLayerClearCoat.js";
export { ANISOTROPIC_CHROME_LAYER } from "./shaders/AnisotropicChromeGLSL.js";
export { createIridescenceLUTTexture } from "./shaders/iridescenceLUT.js";
