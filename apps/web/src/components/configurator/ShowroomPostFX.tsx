"use client";

import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

type ShowroomPostFXProps = {
  enabled: boolean;
};

/**
 * Subtle bloom + vignette for showroom depth (free OSS — @react-three/postprocessing).
 * Disabled when `enabled` is false or when user prefers reduced motion (handled by parent).
 */
export function ShowroomPostFX({ enabled }: ShowroomPostFXProps) {
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
      <Vignette eskil={false} offset={0.1} darkness={0.32} />
    </EffectComposer>
  );
}
