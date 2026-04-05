"use client";

import type { ReactNode } from "react";
import styles from "./ApexStudioEngine.module.css";

export type ApexStudioEngineProps = {
  children: ReactNode;
  /** Visible product name — screen readers + analytics */
  studioLabel?: string;
  /** Show “Apex Studio” eyebrow above preview stack */
  showBranding?: boolean;
};

/**
 * VEX Apex Studio — compositor root for `/build` 3D stack.
 * Wraps `ConfiguratorVehicleCanvas` + studio chrome; adds stable `data-*` hooks for instrumentation.
 * Heavy 3D remains in `ConfiguratorVehicleCanvas` (dynamic import on the page).
 */
export function ApexStudioEngine({
  children,
  studioLabel = "VEX Apex Studio",
  showBranding = true,
}: ApexStudioEngineProps) {
  return (
    <div
      className={styles.root}
      data-apex-studio="1"
      data-apex-studio-version="1.0"
      aria-label={studioLabel}
    >
      {showBranding ? <p className={styles.eyebrow}>Apex Studio</p> : null}
      {children}
    </div>
  );
}
