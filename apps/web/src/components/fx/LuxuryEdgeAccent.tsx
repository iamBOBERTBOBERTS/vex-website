"use client";

import { usePathname } from "next/navigation";
import { useAdaptiveEffects } from "@/hooks/useAdaptiveEffects";
import styles from "./LuxuryEdgeAccent.module.css";

export function LuxuryEdgeAccent() {
  const pathname = usePathname();
  const { allowHeavyFx } = useAdaptiveEffects();
  const enabled = allowHeavyFx && (pathname === "/" || pathname.startsWith("/inventory") || pathname.startsWith("/build"));

  if (!enabled) return null;
  return (
    <div className={styles.wrap} aria-hidden>
      <span className={styles.ring} />
      <span className={styles.ringAlt} />
    </div>
  );
}
