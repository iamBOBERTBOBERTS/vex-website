"use client";

import { PaymentTrustChip } from "@vex/ui";
import { useReveal } from "@/hooks/useReveal";
import styles from "./PaymentOrchestrationBar.module.css";

export function PaymentOrchestrationBar() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className={styles.bar} aria-label="Payment and deposit orchestration" data-reveal>
      <div className={styles.inner}>
        <span className={styles.label}>Payments</span>
        <div className={styles.chips}>
          <PaymentTrustChip>Fiat rails</PaymentTrustChip>
          <PaymentTrustChip>Crypto-ready orchestration</PaymentTrustChip>
          <PaymentTrustChip>Deposits &amp; escrow-style holds</PaymentTrustChip>
          <PaymentTrustChip>Tenant-scoped ledger</PaymentTrustChip>
          <PaymentTrustChip>Audit-ready events</PaymentTrustChip>
        </div>
      </div>
      <p className={styles.note}>
        Production wiring lands in multi-tenant API + queue workers; this bar communicates the intent of the hybrid mesh for
        dealers and buyers.
      </p>
    </section>
  );
}
