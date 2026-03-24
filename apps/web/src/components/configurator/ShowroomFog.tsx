"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

type ShowroomFogProps = {
  enabled: boolean;
};

/** Light exponential fog for depth — matches VEX dark palette. */
export function ShowroomFog({ enabled }: ShowroomFogProps) {
  const { scene } = useThree();

  useEffect(() => {
    if (!enabled) {
      scene.fog = null;
      return;
    }
    scene.fog = new THREE.FogExp2("#06080c", 0.019);
    return () => {
      scene.fog = null;
    };
  }, [enabled, scene]);

  return null;
}
