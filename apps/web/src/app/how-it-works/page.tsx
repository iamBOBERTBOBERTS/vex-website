import Link from "next/link";
import styles from "../marketing-pages.module.css";

const STEPS = [
  {
    number: "01",
    title: "Apply for access",
    copy: "Buyer and seller profiles are screened for identity, fit, and financial seriousness before access is granted.",
  },
  {
    number: "02",
    title: "Present with precision",
    copy: "Vehicles are framed with tighter storytelling, cleaner visuals, and an atmosphere that matches the caliber of the asset.",
  },
  {
    number: "03",
    title: "Close with concierge support",
    copy: "Inspection, transport, and final handover are guided through a single high-context support lane.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>How the flow works</p>
        <h1 className={styles.title}>A calmer, more selective route from introduction to closing.</h1>
        <p className={styles.intro}>
          VEX is built around controlled momentum. The process should feel elegant, legible, and deeply human for both
          buyers and sellers, with every step removing noise instead of adding it.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/inventory" className="btn btnPrimary">
            Browse inventory
          </Link>
          <Link href="/contact" className="btn btnGhost">
            Speak with the team
          </Link>
        </div>
      </section>

      <section className={styles.grid3}>
        {STEPS.map((step) => (
          <article key={step.number} className={styles.panel}>
            <p className={styles.number}>{step.number}</p>
            <h2 className={styles.panelTitle}>{step.title}</h2>
            <p className={styles.copy}>{step.copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
