import Link from "next/link";
import styles from "./Footer.module.css";

const FOOTER_LINKS = [
  { href: "/collections", label: "Collections" },
  { href: "/build", label: "Build" },
  { href: "/#pillars", label: "How it works" },
  { href: "/#services", label: "Services" },
  { href: "/#test-drive", label: "Book a visit" },
  { href: "/#about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const SOCIAL = [
  { href: "#", label: "Twitter" },
  { href: "#", label: "Instagram" },
  { href: "#", label: "LinkedIn" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.brandMark}>Vortex Exotic Exchange</p>
        <div className={styles.links}>
          {FOOTER_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.link}>
              {label}
            </Link>
          ))}
        </div>
        <div className={styles.social}>
          {SOCIAL.map(({ href, label }) => (
            <a key={label} href={href} className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label={label}>
              {label}
            </a>
          ))}
        </div>
        <p className={styles.copyright}>© {year} VEX — Vortex Exotic Exchange. All rights reserved.</p>
      </div>
    </footer>
  );
}
