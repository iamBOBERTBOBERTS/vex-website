"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Bounds, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { EditionId, FinishId, PowertrainId } from "./vehicleFinish";
import { FINISH_PHYSICAL } from "./vehicleFinish";

type GltfVehicleProps = {
  url: string;
  finishId: FinishId;
  edition: EditionId;
  powertrain: PowertrainId;
};

function meshNameLower(obj: THREE.Object3D): string {
  return (obj.name || "").toLowerCase();
}

/** Skip glass, rubber, wheels, lights — paint exterior body panels only. */
function shouldSkipMeshForBodyPaint(name: string): boolean {
  return /lamp|light\b|glass|window|wheel|tire|tyre|rim|brake|disc|caliper|interior|seat|dash|steering|under|engine|exhaust|mirror|chrome|logo|badge|grill|grille|headlight|taillight|signal|ground|shadow|helper/i.test(
    name
  );
}

function applyFinishToBody(
  root: THREE.Object3D,
  finishId: FinishId,
  edition: EditionId,
  powertrain: PowertrainId
): void {
  const spec = FINISH_PHYSICAL[finishId];
  const color = new THREE.Color(spec.hex);

  let roughnessMul = 1;
  let metalnessMul = 1;
  let clearcoatAdd = 0;
  if (edition === "Track") {
    roughnessMul = 0.9;
    clearcoatAdd = 0.06;
  } else if (edition === "Heritage") {
    roughnessMul = 1.06;
    metalnessMul = 0.92;
    clearcoatAdd = -0.02;
  }

  if (powertrain === "Hybrid") {
    metalnessMul *= 0.98;
  }

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const n = meshNameLower(mesh);
    if (shouldSkipMeshForBodyPaint(n)) return;

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      if (!raw) continue;
      if (raw instanceof THREE.MeshPhysicalMaterial) {
        const transmission = raw.transmission ?? 0;
        if (transmission > 0.12) continue;
        raw.color.copy(color);
        raw.metalness = THREE.MathUtils.clamp(spec.metalness * metalnessMul, 0, 1);
        raw.roughness = THREE.MathUtils.clamp(spec.roughness * roughnessMul, 0.04, 1);
        raw.clearcoat = THREE.MathUtils.clamp(spec.clearcoat + clearcoatAdd, 0, 1);
        raw.needsUpdate = true;
      } else if (raw instanceof THREE.MeshStandardMaterial) {
        if (raw.transparent && raw.opacity < 0.95) continue;
        raw.color.copy(color);
        raw.metalness = THREE.MathUtils.clamp(spec.metalness * metalnessMul, 0, 1);
        raw.roughness = THREE.MathUtils.clamp(spec.roughness * roughnessMul, 0.04, 1);
        raw.needsUpdate = true;
      }
    }
  });
}

/** World units: ~4.3m max axis so all catalog GLBs read at similar scale in the viewport. */
const SHOWROOM_TARGET_MAX_EXTENT = 4.35;

function normalizeShowroomScaleAndCenter(root: THREE.Object3D): void {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return;
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(maxDim) || maxDim < 1e-5) return;
  const s = SHOWROOM_TARGET_MAX_EXTENT / maxDim;
  root.scale.setScalar(s);
  root.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  box2.getCenter(center);
  root.position.sub(center);
}

function enhanceLoadedMaps(root: THREE.Object3D, maxAnisotropy: number): void {
  const cap = Math.min(8, Math.max(1, maxAnisotropy));
  const bump = (tex: THREE.Texture | null | undefined) => {
    if (!tex || !tex.isTexture) return;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = cap;
    tex.needsUpdate = true;
  };
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      if (!raw) continue;
      if (raw instanceof THREE.MeshStandardMaterial || raw instanceof THREE.MeshPhysicalMaterial) {
        bump(raw.map);
        bump(raw.normalMap);
        bump(raw.roughnessMap);
        bump(raw.metalnessMap);
        bump(raw.aoMap);
        bump(raw.emissiveMap);
        if (raw instanceof THREE.MeshPhysicalMaterial) {
          bump(raw.clearcoatNormalMap);
        }
      }
    }
  });
}

function enhanceMaterials(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      if (!raw) continue;
      if (raw instanceof THREE.MeshPhysicalMaterial) {
        const glassy = (raw.transmission ?? 0) > 0.02;
        raw.envMapIntensity = Math.max(raw.envMapIntensity ?? 1, glassy ? 1.35 : 1.18);
        raw.clearcoat = Math.max(raw.clearcoat ?? 0, glassy ? 0.02 : 0.12);
        raw.clearcoatRoughness = THREE.MathUtils.clamp(raw.clearcoatRoughness ?? 0.35, 0.12, 0.55);
        if (!glassy) {
          raw.roughness = THREE.MathUtils.clamp(raw.roughness ?? 0.45, 0.12, 0.94);
        }
      } else if (raw instanceof THREE.MeshStandardMaterial) {
        raw.envMapIntensity = Math.max(raw.envMapIntensity ?? 1, 1.02);
        raw.roughness = THREE.MathUtils.clamp(raw.roughness ?? 0.5, 0.18, 0.96);
      }
    }
  });
}

/**
 * Loads a glTF/GLB from URL, centers it, fits to bounds, enables shadows on meshes.
 * Tunes PBR materials slightly for showroom lighting (env reflections, clearcoat floor read).
 */
export function GltfVehicle({ url, finishId, edition, powertrain }: GltfVehicleProps) {
  const { scene } = useGLTF(url);
  const { gl } = useThree();
  const maxAniso = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl]);

  const cloned = useMemo(() => {
    const root = scene.clone(true);
    normalizeShowroomScaleAndCenter(root);
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    enhanceMaterials(root);
    applyFinishToBody(root, finishId, edition, powertrain);
    enhanceLoadedMaps(root, maxAniso);
    return root;
  }, [scene, url, finishId, edition, powertrain, maxAniso]);

  return (
    <Bounds fit clip observe margin={1.06}>
      <primitive object={cloned} />
    </Bounds>
  );
}

export function preloadVehicleGltf(url: string) {
  useGLTF.preload(url);
}
