"use client";

import Link from "next/link";
import { EnterpriseWidgetCard } from "@vex/ui";
import { useReveal } from "@/hooks/useReveal";
import { HeroCinematicLayer } from "@/components/HeroCinematicLayer";
import { HeroScrollHint } from "@/components/HeroScrollHint";
import styles from "./DealerProgramHero.module.css";

export function DealerProgramHero() {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <section className={styles.hero} id="universe" aria-labelledby="dealer-hero-heading">
      <HeroCinematicLayer />
      <div className={styles.ambient} aria-hidden />
      <div className={styles.overlay} />
      <div className={styles.vignette} aria-hidden />
      <div ref={revealRef} className={styles.shell} data-reveal>
        <div className={styles.copy}>
          <div className={styles.badgeRow}>
            <span className={styles.badge}>Dealer program</span>
            <span className={styles.lot}>Integrated marketplace</span>
          </div>
          <p className={styles.kicker}>The new operating system for automotive distribution &amp; management</p>
          <h1 className={styles.headline} id="dealer-hero-heading">
            <span className={styles.headlineAccent}>Full-service dealer OS.</span>
            <span className={styles.headlineSecond}>Cinematic marketplace built in.</span>
          </h1>
          <p className={styles.subhead}>
            White-labeled DMS depth — inventory, CRM, payroll, accounting, integrations, and AI-driven operations — with a
            BaT-grade public engine for listings, consignment, and commissioning.
          </p>
          <div className={styles.ctas}>
            <Link href="/contact?intent=dealer" className={styles.ctaPrimary} data-magnetic="true">
              Join as dealer
            </Link>
            <Link href="/inventory" className={styles.ctaSecondary} data-magnetic="true">
              Shop exotic inventory
            </Link>
          </div>
          <p className={styles.caption}>
            Primary value: enterprise program management. Sublet: consumer-grade discovery, auctions, and configurator-led
            deals — routed into your tenant workspace.
          </p>
        </div>
        <div className={styles.cockpit}>
          <div className={styles.cockpitInner}>
            <p className={styles.cockpitTitle}>Live cockpit preview</p>
            <p className={styles.cockpitSubtitle}>Autonomous DMS signals your dealers see inside VEX.</p>
            <EnterpriseWidgetCard label="Payroll run" value="Queued · 06:00 ET" meta="Human approval on exceptions only" accent="gold" />
            <EnterpriseWidgetCard label="GL reconciliation" value="98.4% matched" meta="2 items flagged for review" accent="cyan" />
            <EnterpriseWidgetCard label="Inventory optimizer" value="+14 turn days" meta="Across 3 rooftops" accent="neutral" />
            <EnterpriseWidgetCard label="Integration hub" value="12 connectors" meta="DMS · CRM · accounting · leads" accent="neutral" />
          </div>
        </div>
      </div>
      <HeroScrollHint />
    </section>
  );
}
