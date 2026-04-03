"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import styles from "./ScrollStorySection.module.css";

export function ScrollStorySection() {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <section id="universe" className={styles.section} aria-labelledby="story-heading">
      <div className={styles.grid} ref={revealRef} data-reveal>
        <p className={styles.chapter}>Chapter 01 / Arrival</p>
        <h2 id="story-heading" className={styles.title}>
          Enter the private universe of verified exotic cars.
        </h2>
        <p className={styles.copy}>
          Every lot is curated like a collector piece: verified provenance, transparent condition narrative, and concierge-grade
          delivery orchestration built for confidence.
        </p>
        <div className={styles.actions}>
          <Link href="/collections" className={styles.primary} data-magnetic="true">
            Explore collections
          </Link>
          <Link href="/build" className={styles.secondary}>
            Begin bespoke build
          </Link>
        </div>
      </div>
    </section>
  );
}
