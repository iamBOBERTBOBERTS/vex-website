import styles from "./EntrySequence.module.css";

const particles = Array.from({ length: 18 }, (_, index) => index);

export function EntryParticles() {
  return (
    <div className={styles.particles} aria-hidden="true">
      {particles.map((particle) => (
        <span key={particle} style={{ "--particle-index": particle } as React.CSSProperties} />
      ))}
    </div>
  );
}
