/**
 * Vehicle 3D asset pipeline (integration contract)
 *
 * **Current:** `Inventory.modelGlbUrl` points to a GLB/GLTF (HTTPS or site-relative `/models/...`).
 * The web viewer loads it with PBR environment lighting and orbit controls.
 *
 * **Planned photo → 3D (your backend):**
 * 1. User/staff uploads N photos of the actual car (fixed workflow: angles, lighting — your SOP).
 * 2. Async job (photogrammetry / NeRF / vendor API) produces `vehicle-{id}.glb` and writes it to object storage.
 * 3. PATCH `/inventory/:id` with `{ modelGlbUrl, modelSource: "GENERATED_FROM_PHOTOS", modelSourcePhotoIds: [...] }`.
 * 4. The same viewer loads that URL — users see the reconstruction of **that** listing, not a stock mesh.
 *
 * **Hyper-realism** comes from: high-quality source GLB (PBR materials), HDR environment, resolution,
 * and capture quality — not from the viewer alone.
 *
 * **Viewer stack (web, free OSS):** ACES filmic tone mapping, PMREM via drei `Environment`, soft shadows,
 * optional bloom/vignette (`@react-three/postprocessing`), reflective floor (`MeshReflectorMaterial`),
 * exponential fog. Respects `prefers-reduced-motion` (drops post-FX + reflector, keeps grid).
 */

export type VehicleModelSourceApi = "LIBRARY" | "UPLOAD" | "GENERATED_FROM_PHOTOS";
