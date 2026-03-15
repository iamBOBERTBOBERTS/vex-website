"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import styles from "./Hero.module.css";

export function Hero() {
  const revealRef = useReveal();
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      <div ref={revealRef} className={styles.content} data-reveal>
        <h1 className={styles.headline}>Where Exotics Meet Excellence</h1>
        <p className={styles.subhead}>
          Build your dream ride, configure financing, and have it delivered to your door. No pressure — just possibility.
        </p>
        <div className={styles.ctas}>
          <Link href="/inventory" className={styles.ctaPrimary}>
            View Inventory
          </Link>
          <Link href="/build" className={styles.ctaSecondary}>
            Build Your Ride
          </Link>
        </div>
      </div>
    </section>
  );
}
