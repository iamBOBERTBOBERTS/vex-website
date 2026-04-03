"use client";

import { formatUsd } from "@/lib/formatCurrency";
import styles from "./ConfidencePanelV2.module.css";

export type ConfidencePanelV2Props = {
  totalPrice: number;
  /** Optional monthly estimate for financing teaser (illustrative). */
  estimatedMonthly?: number | null;
};

export function ConfidencePanelV2({ totalPrice, estimatedMonthly }: ConfidencePanelV2Props) {
  const monthly =
    estimatedMonthly != null && estimatedMonthly > 0
      ? formatUsd(Math.round(estimatedMonthly))
      : formatUsd(Math.round(totalPrice / 60));

  return (
    <div className={styles.root}>
      <div className={styles.block}>
        <p className={styles.label}>Live commission total</p>
        <p className={styles.total}>{formatUsd(totalPrice)}</p>
        <p className={styles.financingTeaser}>
          Financing from <strong>{monthly}/mo</strong> — illustrative; final terms at checkout.
        </p>
      </div>

      <div className={styles.divider} aria-hidden />

      <div className={styles.block}>
        <p className={styles.label}>Expert curated specs</p>
        <p className={styles.body}>
          Studio-balanced edition, powertrain, and finish pairings — tuned for presence, drivability, and resale narrative.
        </p>
      </div>

      <div className={styles.row}>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Estimated delivery</p>
          <p className={styles.kpiValue}>4–8 weeks</p>
        </div>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Valuation confidence</p>
          <p className={styles.kpiValue}>High</p>
        </div>
      </div>

      <p className={styles.disclaimer}>
        Figures are estimates for planning. Sealed pricing, logistics, and appraisal depth are finalized in deal flow.
      </p>
    </div>
  );
}
