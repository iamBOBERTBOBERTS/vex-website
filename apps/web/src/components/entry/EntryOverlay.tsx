import styles from "./EntrySequence.module.css";

export function EntryOverlay() {
  return (
    <div className={styles.overlay} aria-hidden="true">
      <div className={styles.aperture} />
      <div className={styles.vignette} />
    </div>
  );
}
