/**
 * Default glTF when no listing `modelGlbUrl` (demo / fallback).
 * Khronos CesiumMilkTruck — tiny, CORS-friendly, vehicle-shaped.
 *
 * **Free sources for production-quality assets (no cost, run locally or self-host):**
 * - **Khronos glTF Sample Models** — https://github.com/KhronosGroup/glTF-Sample-Models (CC-BY / public domain varies per model)
 * - **Poly Haven** — https://polyhaven.com (HDRIs, textures, some models; CC0)
 * - **Blender** — import CAD / photogrammetry, export GLB with PBR; run offline
 * - **Meshroom** / **COLMAP** — open-source photogrammetry from photo sets → mesh → Blender → GLB
 *
 * Host large `.glb` / HDR on your CDN or `apps/web/public/models/` (keep repo lean; prefer CDN).
 */
export const DEFAULT_PUBLIC_VEHICLE_GLB =
  "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb";
