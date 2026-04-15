import Link from "next/link";
import styles from "../marketing-pages.module.css";

export default function SellPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Seller entry</p>
        <h1 className={styles.title}>For owners who want more than exposure.</h1>
        <p className={styles.intro}>
          Listing with VEX should feel private, intentional, and premium from the first touch. We shape the narrative,
          control the audience, and manage the conversation with collector-grade discipline.
        </p>
      </section>

      <section className={styles.grid2}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>What sellers get</h2>
          <p className={styles.copy}>
            The goal is not maximum volume. It is the right buyer, the right framing, and the least-friction path to a
            secure close.
          </p>
          <ul className={styles.list}>
            <li>Private listing visibility and qualified buyer access</li>
            <li>Editorial presentation tuned for rarity and confidence</li>
            <li>Concierge support for inspection, transport, and handover</li>
          </ul>
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Start a submission</h2>
          <p className={styles.copy}>
            Share the vehicle, your ideal timeline, and any important provenance details. The acquisition team will
            respond with a tailored path rather than a generic intake sequence.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/contact" className="btn btnPrimary">
              Submit your vehicle
            </Link>
            <Link href="/how-it-works" className="btn btnGhost">
              Review the process
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
