"use client";

import { useMemo } from "react";
import { Vector2 } from "three";
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing";

type ShowroomPostFXProps = {
  enabled: boolean;
};

/**
 * Subtle bloom + violet-gold chromatic fringe + vignette (aligned with `VortexPostFXStack` language, lower weight).
 * Disabled when `enabled` is false or when user prefers reduced motion (handled by parent).
 */
export function ShowroomPostFX({ enabled }: ShowroomPostFXProps) {
  const chroma = useMemo(() => new Vector2(0.00042, 0.00058), []);

  if (!enabled) return null;

  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom
        intensity={0.26}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.028}
        mipmapBlur
        radius={0.42}
      />
      <ChromaticAberration offset={chroma} radialModulation={true} modulationOffset={0.38} />
      <Vignette eskil={false} offset={0.1} darkness={0.32} />
    </EffectComposer>
  );
}
