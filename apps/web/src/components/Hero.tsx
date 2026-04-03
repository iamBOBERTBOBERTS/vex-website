"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import { ExoticVisualization } from "@/components/ExoticVisualization";
import { HeroScrollHint } from "@/components/HeroScrollHint";
import { HeroCinematicLayer } from "@/components/HeroCinematicLayer";
import styles from "./Hero.module.css";

export function Hero() {
  const revealRef = useReveal<HTMLDivElement>();
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <HeroCinematicLayer />
      <div className={styles.ambient} aria-hidden />
      <div className={styles.overlay} />
      <div className={styles.vignette} aria-hidden />
      <div ref={revealRef} className={styles.shell} data-reveal>
        <div className={styles.copy}>
          <div className={styles.badgeRow}>
            <span className={styles.badge}>VEX</span>
            <span className={styles.lot}>Exotic cars</span>
          </div>
          <p className={styles.kicker}>Welcome to the VEX universe - where provenance meets velocity.</p>
          <h1 className={styles.headline} id="hero-heading">
            <span className={styles.headlineGradient}>Rare metal.</span>
            <br />
            <span className={styles.headlineSolid}>No compromise.</span>
          </h1>
          <p className={styles.subhead}>
            Move through curated chapters: discover collectible inventory, craft your exact configuration, and close with concierge precision.
          </p>
          <div className={styles.ctas}>
            <Link href="/inventory" className={styles.ctaPrimary} data-magnetic="true">
              Browse cars
            </Link>
            <Link href="/build" className={styles.ctaSecondary} data-magnetic="true">
              Build yours
            </Link>
          </div>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>Sales</dt>
              <dd className={styles.statValue}>Private</dd>
            </div>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>History</dt>
              <dd className={styles.statValue}>Verified</dd>
            </div>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>Shipping</dt>
              <dd className={styles.statValue}>Enclosed</dd>
            </div>
          </dl>
        </div>
        <div className={styles.visualWrap}>
          <div className={styles.visualInner}>
            <ExoticVisualization />
          </div>
        </div>
      </div>
      <HeroScrollHint />
    </section>
  );
}
