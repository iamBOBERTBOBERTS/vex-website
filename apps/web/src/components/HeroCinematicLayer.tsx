"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./Hero.module.css";

/**
 * Optional full-bleed loop **video** behind `DealerProgramHero` (not WebGL).
 * Set NEXT_PUBLIC_HERO_VIDEO_URL (and optionally NEXT_PUBLIC_HERO_VIDEO_POSTER).
 * Disabled when prefers-reduced-motion is on or URL is unset.
 * 3D / WebGL gating: `NEXT_PUBLIC_ENABLE_HERO_WEBGL` + `shouldUseWebGL()` via `useWebglEligible` / `useHeroWebglDisplayMode` —
 * marketing **`DynamicHeroShell`** (vortex vs `DealerProgramHero`), **`ConfiguratorVehicleCanvas`**, **`InventoryVehicleViewer`**.
 * Scroll-linked motion on the WebGL hero uses **`useApexHeroOrchestration`** (R3F clock + scroll ref); keep GSAP/Lenis timelines **rAF-aligned** and cap at display refresh (see elite plan §21 / §24).
 */
export function HeroCinematicLayer() {
  const reduced = usePrefersReducedMotion();
  const src = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;
  const poster = process.env.NEXT_PUBLIC_HERO_VIDEO_POSTER;

  if (reduced || !src) return null;

  return (
    <video
      className={styles.videoBg}
      src={src}
      poster={poster || undefined}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      aria-hidden
    />
  );
}
