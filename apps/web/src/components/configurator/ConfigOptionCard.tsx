"use client";

import styles from "./ConfigOptionCard.module.css";

export type ConfigOptionCardProps = {
  name: string;
  priceLabel: string;
  selected: boolean;
  onSelect: () => void;
};

export function ConfigOptionCard({ name, priceLabel, selected, onSelect }: ConfigOptionCardProps) {
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      onClick={onSelect}
    >
      <span className={styles.name}>{name}</span>
      <span className={styles.price}>{priceLabel}</span>
    </button>
  );
}
