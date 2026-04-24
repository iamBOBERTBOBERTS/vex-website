import Lenis from "lenis";

let lenis: Lenis | null = null;
let rafId = 0;

type InitLenisOptions = {
  onScroll?: () => void;
};

export function initLenis(options: InitLenisOptions = {}) {
  if (typeof window === "undefined") return null;

  if (!lenis) {
    lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      syncTouch: false,
    });

    function raf(time: number) {
      lenis?.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);
  }

  if (options.onScroll) {
    lenis.on("scroll", options.onScroll);
  }

  return lenis;
}

export function destroyLenis() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  lenis?.destroy();
  lenis = null;
}
