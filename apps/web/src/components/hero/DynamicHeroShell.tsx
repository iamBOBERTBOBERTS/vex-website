"use client";

import dynamic from "next/dynamic";

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

/** SSR-safe shell: loads elite hero + WebGL only on the client. */
export function DynamicHeroShell() {
  return <VortexHeroScene />;
}
