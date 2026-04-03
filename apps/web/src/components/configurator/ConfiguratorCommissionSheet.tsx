"use client";

import Link from "next/link";
import type { Vehicle } from "@/lib/api";
import { formatUsd } from "@/lib/formatCurrency";
import { ConfidencePanelV2 } from "./ConfidencePanelV2";
import styles from "./ConfiguratorCommissionSheet.module.css";

export type CommissionStep = {
  label: string;
  index: number;
};

export type ConfiguratorCommissionSheetProps = {
  vehicle: Vehicle;
  edition: string;
  powertrain: string;
  finishLabel: string;
  totalPrice: number;
  selectedLines: { label: string; delta: number }[];
  stepIndex: number;
  steps: CommissionStep[];
  checkoutQuery?: string;
  className?: string;
};

export function ConfiguratorCommissionSheet({
  vehicle,
  edition,
  powertrain,
  finishLabel,
  totalPrice,
  selectedLines,
  stepIndex,
  steps,
  checkoutQuery = "build=1",
  className,
}: ConfiguratorCommissionSheetProps) {
  const next = steps.find((s) => s.index === stepIndex + 1);

  return (
    <aside className={[styles.sheet, className].filter(Boolean).join(" ")} aria-label="Commission summary">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Commission</p>
        <h2 className={styles.title}>
          {vehicle.make} {vehicle.model}
        </h2>
        <p className={styles.sub}>
          {vehicle.year} · {vehicle.trimLevel}
        </p>
      </div>

      <dl className={styles.specGrid}>
        <div>
          <dt>Edition</dt>
          <dd>{edition}</dd>
        </div>
        <div>
          <dt>Power</dt>
          <dd>{powertrain}</dd>
        </div>
        <div className={styles.specFull}>
          <dt>Finish</dt>
          <dd>{finishLabel}</dd>
        </div>
      </dl>

      {selectedLines.length > 0 ? (
        <ul className={styles.lines}>
          {selectedLines.map((line) => (
            <li key={line.label}>
              <span>{line.label}</span>
              <span>{line.delta > 0 ? `+${formatUsd(line.delta)}` : "Included"}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <ConfidencePanelV2 totalPrice={totalPrice} />

      <div className={styles.footer}>
        {next ? (
          <p className={styles.nextHint}>
            Next: <strong>{next.label}</strong>
          </p>
        ) : (
          <p className={styles.nextHint}>Ready to seal the deal</p>
        )}
        <Link href={`/checkout?${checkoutQuery}`} className={styles.checkout}>
          Continue to checkout
        </Link>
      </div>
    </aside>
  );
}
