"use client";

import { useReveal } from "@/hooks/useReveal";
import styles from "./TrustStrip.module.css";

const TESTIMONIALS = [
  {
    quote: "From config to delivery, everything was seamless. Exactly what you’d expect at this level.",
    author: "— M. K.",
    role: "VIP Client",
  },
  {
    quote: "No pressure, no runaround. I built the spec I wanted and had a number in minutes.",
    author: "— J. R.",
    role: "First-time buyer",
  },
  {
    quote: "The team understood what I was looking for. The deal analysis alone was worth it.",
    author: "— A. S.",
    role: "Check My Deal subscriber",
  },
];

export function TrustStrip() {
  const ref = useReveal();
  return (
    <section ref={ref} className={styles.section} data-reveal>
      <h2 className={styles.title}>What clients say</h2>
      <div className={styles.grid}>
        {TESTIMONIALS.map((t, i) => (
          <blockquote key={i} className={styles.card}>
            <p className={styles.quote}>{t.quote}</p>
            <footer className={styles.author}>{t.author}</footer>
            <span className={styles.role}>{t.role}</span>
          </blockquote>
        ))}
      </div>
      <div className={styles.logos}>
        <span className={styles.logoLabel}>Trusted by enthusiasts worldwide</span>
        <div className={styles.logoPlaceholders}>
          <span className={styles.logoPlaceholder}>Partner</span>
          <span className={styles.logoPlaceholder}>Press</span>
          <span className={styles.logoPlaceholder}>Certified</span>
        </div>
      </div>
    </section>
  );
}
