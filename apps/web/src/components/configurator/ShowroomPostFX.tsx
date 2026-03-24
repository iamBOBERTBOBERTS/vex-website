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
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.42}
        luminanceThreshold={0.62}
        luminanceSmoothing={0.035}
        mipmapBlur
        radius={0.5}
      />
      <Vignette eskil={false} offset={0.12} darkness={0.38} />
    </EffectComposer>
  );
}
