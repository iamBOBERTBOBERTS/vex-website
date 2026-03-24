"use client";

import { useEffect } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ambientLog } from "@/lib/ambientLog";
import styles from "./AmbientShell.module.css";

/**
 * Site-wide dynamic background: layered mesh, drifting light orbs, sweep, grid, grain, vignette.
 * Respects prefers-reduced-motion (static atmosphere).
 */
export function AmbientShell() {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    ambientLog.debug("shell", "Ambient atmosphere active", {
      reducedMotion,
      layers: ["deep", "mesh", "sweep", "grid", "orbs", "grain", "vignette"],
    });
  }, [reducedMotion]);

  const staticMotion = reducedMotion;

  return (
    <div
      className={`${styles.root} ${staticMotion ? styles.reduced : ""}`}
      aria-hidden
      data-ambient-root
    >
      <div className={styles.layerDeep} />
      <div className={`${styles.layerMesh} ${staticMotion ? styles.layerMeshStatic : ""}`} />
      <div className={`${styles.layerSweep} ${staticMotion ? styles.layerSweepStatic : ""}`} />
      <div className={styles.layerGrid} />
      <div className={styles.orbs}>
        <div className={`${styles.orb} ${styles.orb1} ${staticMotion ? styles.orbStatic : ""}`} />
        <div className={`${styles.orb} ${styles.orb2} ${staticMotion ? styles.orbStatic : ""}`} />
        <div className={`${styles.orb} ${styles.orb3} ${staticMotion ? styles.orbStatic : ""}`} />
        <div className={`${styles.orb} ${styles.orb4} ${staticMotion ? styles.orbStatic : ""}`} />
      </div>
      <div className={`${styles.layerGrain} ${staticMotion ? styles.layerGrainStatic : ""}`} />
      <div className={styles.layerVignette} />
    </div>
  );
}
