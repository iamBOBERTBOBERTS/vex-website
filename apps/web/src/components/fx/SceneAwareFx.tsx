"use client";

import { usePathname } from "next/navigation";
import { useAdaptiveEffects } from "@/hooks/useAdaptiveEffects";
import { ButtonSoundFX } from "./ButtonSoundFX";
import { CursorFX } from "./CursorFX";
import { MagneticFX } from "./MagneticFX";
import { ParallaxBackdrop } from "./ParallaxBackdrop";
import { RouteTransitionFX } from "./RouteTransitionFX";

export function SceneAwareFx() {
  const pathname = usePathname();
  const { allowHeavyFx } = useAdaptiveEffects();
  const cinematic = pathname === "/" || pathname.startsWith("/inventory") || pathname.startsWith("/build");
  const allowCursor = !pathname.startsWith("/build");
  const allowParallax = pathname === "/" || pathname.startsWith("/inventory");

  return (
    <>
      {cinematic && allowHeavyFx ? (
        <>
          {allowParallax ? <ParallaxBackdrop /> : null}
          <MagneticFX />
          {allowCursor ? <CursorFX /> : null}
        </>
      ) : null}
      <RouteTransitionFX />
      <ButtonSoundFX />
    </>
  );
}
