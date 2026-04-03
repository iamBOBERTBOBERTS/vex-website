"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type LenisLike = {
  raf: (time: number) => void;
  destroy: () => void;
};

const SCENE_BY_PATH: Array<{ test: (path: string) => boolean; scene: string }> = [
  { test: (path) => path === "/", scene: "home" },
  { test: (path) => path.startsWith("/inventory"), scene: "inventory" },
  { test: (path) => path.startsWith("/build"), scene: "build" },
  { test: (path) => path.startsWith("/portal"), scene: "portal" },
];

function getScene(pathname: string): string {
  return SCENE_BY_PATH.find((item) => item.test(pathname))?.scene ?? "default";
}

export function CinematicMotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    document.documentElement.dataset.scene = getScene(pathname);
    if (reduced) document.documentElement.classList.add("reduced-motion");
    else document.documentElement.classList.remove("reduced-motion");
  }, [pathname, reduced]);

  useEffect(() => {
    let rafId = 0;
    let lenis: LenisLike | null = null;

    async function setup() {
      if (reduced) return;

      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      gsap.registerPlugin(ScrollTrigger);
      lenis = new Lenis({
        duration: 1.1,
        wheelMultiplier: 0.95,
        smoothWheel: true,
      }) as LenisLike;

      const loop = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    }

    setup().catch(() => {});
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
