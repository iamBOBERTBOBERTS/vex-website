"use client";

import dynamic from "next/dynamic";
import { DealerProgramHero } from "@/components/landing/DealerProgramHero";
import { useHeroWebglDisplayMode } from "@/hooks/useHeroWebglDisplayMode";

const VortexHeroScene = dynamic(
  () => import("./ApexHeroScene"),
  {
    ssr: false,
    loading: () => (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "#0a0a0a" }}
        aria-hidden
      />
    ),
  },
);

/**
 * SSR-safe: resolves WebGL eligibility + `NEXT_PUBLIC_ENABLE_HERO_WEBGL`.
 * **vortex** → `ApexHeroScene` / `VortexHeroScene` — GLB from `resolveHeroVehicleGlbUrl()` (`NEXT_PUBLIC_HERO_VEHICLE_GLB` or Khronos default); ≤512 particles + post stack in `@vex/ui`.
 * **legacy** → `DealerProgramHero` (CSS vault sheen + optional **`HeroCinematicLayer`** video only — no R3F there).
 */
export function DynamicHeroShell() {
  const mode = useHeroWebglDisplayMode();

  if (mode === "legacy") {
    return <DealerProgramHero />;
  }

  if (mode === "pending") {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "#0a0a0a" }}
        aria-hidden
      />
    );
  }

  return <VortexHeroScene />;
}
