"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Bounds, Center, useGLTF } from "@react-three/drei";

type GltfVehicleProps = {
  url: string;
};

function enhanceMaterials(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      if (!raw) continue;
      if (raw instanceof THREE.MeshPhysicalMaterial) {
        raw.envMapIntensity = Math.max(raw.envMapIntensity ?? 1, 0.95);
        raw.clearcoat = Math.max(raw.clearcoat ?? 0, 0.08);
        raw.clearcoatRoughness = Math.min(raw.clearcoatRoughness ?? 0.5, 0.45);
        raw.roughness = Math.min(raw.roughness ?? 0.5, 0.92);
      } else if (raw instanceof THREE.MeshStandardMaterial) {
        raw.envMapIntensity = Math.max(raw.envMapIntensity ?? 1, 0.88);
        raw.roughness = Math.min(raw.roughness ?? 0.5, 0.95);
      }
    }
  });
}

/**
 * Loads a glTF/GLB from URL, centers it, fits to bounds, enables shadows on meshes.
 * Tunes PBR materials slightly for showroom lighting (env reflections, clearcoat floor read).
 */
export function GltfVehicle({ url }: GltfVehicleProps) {
  const { scene } = useGLTF(url);

  const cloned = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    enhanceMaterials(root);
    return root;
  }, [scene]);

  return (
    <Bounds fit clip observe margin={1.25}>
      <Center>
        <primitive object={cloned} />
      </Center>
    </Bounds>
  );
}

export function preloadVehicleGltf(url: string) {
  useGLTF.preload(url);
}
