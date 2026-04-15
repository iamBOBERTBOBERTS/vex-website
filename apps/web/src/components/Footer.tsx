import Link from "next/link";
import styles from "./Footer.module.css";

const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.brandColumn}>
          <p className={styles.brand}>VEX</p>
          <p className={styles.copy}>
            Private-market presentation, qualified access, and concierge-led closings for exceptional vehicles.
          </p>
        </div>

        <div className={styles.linkColumn}>
          <p className={styles.label}>Explore</p>
          <Link href="/inventory" className={styles.link}>
            Inventory
          </Link>
          <Link href="/how-it-works" className={styles.link}>
            How It Works
          </Link>
          <Link href="/sell" className={styles.link}>
            Sell Your Car
          </Link>
        </div>

        <div className={styles.linkColumn}>
          <p className={styles.label}>Company</p>
          <Link href="/contact" className={styles.link}>
            Contact
          </Link>
          <Link href="/privacy" className={styles.link}>
            Privacy
          </Link>
          <Link href="/terms" className={styles.link}>
            Terms
          </Link>
        </div>

        <div className={styles.linkColumn}>
          <p className={styles.label}>Direct</p>
          <a href={contactPhone ? `tel:${contactPhone.replace(/\D/g, "")}` : undefined} className={styles.link}>
            {contactPhone || "Phone on request"}
          </a>
          <a href={contactEmail ? `mailto:${contactEmail}` : undefined} className={styles.link}>
            {contactEmail || "Email on request"}
          </a>
          <p className={styles.muted}>Human-led response for discreet, high-value inquiries.</p>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>Copyright {year} VEX Auto. All rights reserved.</p>
        <p>Built for private acquisitions, selective consignment, and seamless collector-grade flow.</p>
      </div>
    </footer>
  );
}
