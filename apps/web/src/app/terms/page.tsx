import Link from "next/link";
import styles from "../marketing-pages.module.css";

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Terms</p>
        <h1 className={styles.title}>Private-market access comes with clear expectations.</h1>
        <p className={styles.intro}>
          VEX operates as a selective marketplace. Access, communication, and transaction participation are reserved for
          verified parties and remain subject to platform review, seller approval, and transaction-specific terms.
        </p>
      </section>

      <section className={styles.grid2}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Private marketplace access</h2>
          <p className={styles.copy}>
            Buyer and seller participation may require identity review, proof of legitimacy, and additional context
            before introductions are facilitated.
          </p>
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Transaction-specific documentation</h2>
          <p className={styles.copy}>
            Final commercial terms, handover responsibilities, and inspection conditions are governed by the transaction
            documents provided in connection with a specific deal.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/contact" className="btn btnPrimary">
              Request full details
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
