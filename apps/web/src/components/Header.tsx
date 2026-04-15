"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { href: "/inventory", label: "Inventory" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/sell", label: "Sell Your Car" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.shell}>
        <Link href="/" className={styles.brand} onClick={() => setMenuOpen(false)}>
          <span className={styles.brandWord}>VEX</span>
          <span className={styles.brandSub}>Private motor market</span>
        </Link>

        <nav className={styles.navDesktop} aria-label="Primary navigation">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <Link href="/contact" className={styles.cta} onClick={() => setMenuOpen(false)}>
            Begin Concierge Review
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((state) => !state)}
          >
            <span className={menuOpen ? styles.burgerOpen : styles.burger} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className={styles.mobileMenu}>
          <button type="button" className={styles.mobileOverlay} onClick={() => setMenuOpen(false)} aria-label="Close menu" />
          <div className={styles.mobileSheet}>
            <p className={styles.mobileEyebrow}>Navigate the private market</p>
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.mobileLink} ${active ? styles.mobileLinkActive : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
            <Link href="/contact" className={styles.mobileCta} onClick={() => setMenuOpen(false)}>
              Begin Concierge Review
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
