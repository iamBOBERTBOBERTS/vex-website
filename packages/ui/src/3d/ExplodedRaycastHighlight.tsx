"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type HitMesh = { mesh: THREE.Mesh; prevEmissive: THREE.Color; prevIntensity: number };

/**
 * Exploded-view: raycast hover highlights meshes (emissive pulse + iridescence read via motion).
 * Best-effort — skips non-Physical materials.
 */
export function ExplodedRaycastHighlight({ enabled }: { enabled: boolean }) {
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());
  const lastHit = useRef<HitMesh | null>(null);

  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, [gl]);

  useFrame(() => {
    if (!enabled) {
      if (lastHit.current) {
        const h = lastHit.current;
        if (h.mesh.material instanceof THREE.MeshPhysicalMaterial) {
          h.mesh.material.emissive.copy(h.prevEmissive);
          h.mesh.material.emissiveIntensity = h.prevIntensity;
        }
        lastHit.current = null;
      }
      return;
    }

    raycaster.current.setFromCamera(pointer.current, camera);
    const hits = raycaster.current.intersectObjects(scene.children, true);
    let mesh: THREE.Mesh | null = null;
    for (const h of hits) {
      if (h.object instanceof THREE.Mesh && h.object.visible) {
        mesh = h.object;
        break;
      }
    }

    if (lastHit.current && lastHit.current.mesh !== mesh) {
      const prev = lastHit.current;
      if (prev.mesh.material instanceof THREE.MeshPhysicalMaterial) {
        prev.mesh.material.emissive.copy(prev.prevEmissive);
        prev.mesh.material.emissiveIntensity = prev.prevIntensity;
      }
      lastHit.current = null;
    }

    if (!mesh && lastHit.current) {
      const prev = lastHit.current;
      if (prev.mesh.material instanceof THREE.MeshPhysicalMaterial) {
        prev.mesh.material.emissive.copy(prev.prevEmissive);
        prev.mesh.material.emissiveIntensity = prev.prevIntensity;
      }
      lastHit.current = null;
      return;
    }

    if (mesh && mesh.material instanceof THREE.MeshPhysicalMaterial) {
      if (!lastHit.current || lastHit.current.mesh !== mesh) {
        const m = mesh.material;
        lastHit.current = {
          mesh,
          prevEmissive: m.emissive.clone(),
          prevIntensity: m.emissiveIntensity,
        };
      }
      const t = performance.now() * 0.004;
      const pulse = 0.5 + 0.5 * Math.sin(t);
      mesh.material.emissive.setRGB(0.25 + 0.2 * pulse, 0.42 + 0.25 * pulse, 0.55 + 0.2 * pulse);
      mesh.material.emissiveIntensity = 0.22 + 0.18 * pulse;
    }
  });

  return null;
}
