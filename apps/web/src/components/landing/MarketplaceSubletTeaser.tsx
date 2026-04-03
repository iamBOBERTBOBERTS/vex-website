"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import styles from "./MarketplaceSubletTeaser.module.css";

export function MarketplaceSubletTeaser() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className={styles.section} id="marketplace-sublet" aria-labelledby="sublet-heading" data-reveal>
      <div className={styles.inner}>
        <div>
          <p className={styles.eyebrow}>Integrated marketplace · sublet engine</p>
          <h2 className={styles.title} id="sublet-heading">
            The public face of your dealer program
          </h2>
          <p className={styles.lede}>
            Listings, enthusiast auctions, consignment, and commissioning — cinematic for buyers, operational for dealers.
            Leads and deals land in the same multi-tenant workspace as payroll and inventory.
          </p>
          <div className={styles.links}>
            <Link href="/inventory" className={styles.linkPrimary}>
              Browse inventory
            </Link>
            <Link href="/build" className={styles.link}>
              Open configurator
            </Link>
            <Link href="/#configure" className={styles.link}>
              3D studio chapter
            </Link>
          </div>
          <div className={styles.chips} style={{ marginTop: "1rem" }}>
            <span className={styles.chip}>BaT-style lanes</span>
            <span className={styles.chip}>Autotrader-class discovery</span>
            <span className={styles.chip}>Consignment</span>
            <span className={styles.chip}>White-label ready</span>
          </div>
        </div>
        <aside className={styles.aside} aria-label="How marketplace connects to DMS">
          <p className={styles.asideTitle}>Same platform</p>
          <ul className={styles.asideList}>
            <li>Marketplace events create tenant-scoped CRM records.</li>
            <li>Deposits and checkout orchestration respect dealer policy.</li>
            <li>Configurator and inventory previews reuse your live catalog.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
