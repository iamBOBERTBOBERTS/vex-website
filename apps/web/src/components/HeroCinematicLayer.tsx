"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./Hero.module.css";

/**
 * Optional full-bleed loop **video** behind `DealerProgramHero` (not WebGL).
 * **Never** add an R3F `<Canvas>` here — the WebGL hero is **`DynamicHeroShell` → `ApexHeroScene` / `VortexHeroScene`**
 * when `useHeroWebglDisplayMode()` resolves **`vortex`**; stacking Canvas layers would duplicate GPU work and bypass the gate.
 * Set NEXT_PUBLIC_HERO_VIDEO_URL (and optionally NEXT_PUBLIC_HERO_VIDEO_POSTER).
 * Disabled when prefers-reduced-motion is on or URL is unset.
 * Related 3D surfaces: **`ConfiguratorVehicleCanvas`**, **`InventoryVehicleViewer`** (`useWebglEligible` + `NEXT_PUBLIC_ENABLE_HERO_WEBGL`).
 * Scroll-linked motion on the **vortex** hero uses **`useApexHeroOrchestration`**; keep GSAP/Lenis **rAF-aligned** (see elite plan §21 / §24).
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
