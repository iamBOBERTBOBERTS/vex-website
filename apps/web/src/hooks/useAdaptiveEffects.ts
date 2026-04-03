"use client";

import { useMemo } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type NavigatorWithDeviceMemory = Navigator & { deviceMemory?: number };

export function useAdaptiveEffects() {
  const reducedMotion = usePrefersReducedMotion();

  return useMemo(() => {
    if (typeof navigator === "undefined") {
      return { allowHeavyFx: !reducedMotion, maxDpr: 2 };
    }

    const nav = navigator as NavigatorWithDeviceMemory;
    const memory = nav.deviceMemory ?? 8;
    const cores = navigator.hardwareConcurrency ?? 8;
    const constrained = memory <= 4 || cores <= 4 || reducedMotion;

    return {
      allowHeavyFx: !constrained,
      maxDpr: constrained ? 1.5 : 2.2,
    };
  }, [reducedMotion]);
}
