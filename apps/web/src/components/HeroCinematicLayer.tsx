"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./Hero.module.css";

/**
 * Optional full-bleed loop video behind hero content.
 * Set NEXT_PUBLIC_HERO_VIDEO_URL (and optionally NEXT_PUBLIC_HERO_VIDEO_POSTER).
 * Disabled when prefers-reduced-motion is on or URL is unset.
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
