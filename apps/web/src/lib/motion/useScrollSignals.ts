"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollSignals() {
  const lastY = useRef(0);
  const [signals, setSignals] = useState({ y: 0, direction: "down" as "up" | "down", active: false });

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const y = window.scrollY;
      const direction = y >= lastY.current ? "down" : "up";
      lastY.current = y;
      setSignals({ y, direction, active: y > 8 });
      frame = 0;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return signals;
}
