"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { EntryLightSweep } from "./EntryLightSweep";
import { EntryOverlay } from "./EntryOverlay";
import { EntryParticles } from "./EntryParticles";
import { hasSeenEntry, markEntrySeen } from "./EntryState";
import styles from "./EntrySequence.module.css";

export function EntrySequence() {
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion || hasSeenEntry()) return;

    setVisible(true);
    markEntrySeen();

    const timeout = window.setTimeout(() => setVisible(false), 3200);
    return () => window.clearTimeout(timeout);
  }, [reducedMotion]);

  if (!visible) return null;

  return (
    <div className={styles.sequence} role="presentation" aria-hidden="true">
      <EntryOverlay />
      <EntryParticles />
      <EntryLightSweep />
      <div className={styles.brandLockup}>
        <p>VEX</p>
        <span>Private automotive access</span>
      </div>
    </div>
  );
}
