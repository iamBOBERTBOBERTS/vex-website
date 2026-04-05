"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

/** Maps R3F pointer to `uMouseInfluence` (0–1) for iridescence + flake layers. */
export function CinematicMouseUniform({ root }: { root: THREE.Object3D | null }) {
  const ref = useRef<THREE.Object3D | null>(null);
  ref.current = root;
  const { mouse } = useThree();
  useFrame(() => {
    const obj = ref.current;
    if (!obj) return;
    const u = obj.userData.__cinematicMouse as THREE.IUniform<THREE.Vector2> | undefined;
    if (u) u.value.set(mouse.x * 0.5 + 0.5, mouse.y * 0.5 + 0.5);
  });
  return null;
}
