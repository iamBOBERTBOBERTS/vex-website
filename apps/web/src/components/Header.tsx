"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./Header.module.css";

/** Short labels, few choices — easier to scan on every screen size. */
const NAV_LINKS = [
  { href: "/#universe", label: "01 Universe" },
  { href: "/collections", label: "02 Collections" },
  { href: "/build", label: "03 Build" },
  { href: "/#pillars", label: "04 Process" },
  { href: "/contact", label: "05 Contact" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [activeChapter, setActiveChapter] = useState<string>("/#universe");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveChapter(pathname);
      return;
    }
    const ids = ["universe", "pillars", "configure", "test-drive"];
    const obs = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (active?.target?.id) setActiveChapter(`/#${active.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0.2, 0.45, 0.7] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [pathname]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <Link href="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
        {!logoError ? (
          <Image
            src="/no-bg-logo.png"
            alt="VEX — Vortex Exotic Exchange"
            width={140}
            height={48}
            priority
            className={styles.logoImage}
            unoptimized
            onError={() => setLogoError(true)}
          />
        ) : null}
        <span className={styles.logoFallback} style={{ visibility: logoError ? "visible" : "hidden" }}>
          VEX
        </span>
      </Link>
      <nav className={styles.navDesktop} aria-label="Main">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={styles.navLink}
            aria-current={activeChapter === href || pathname === href ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className={styles.actions}>
        <div className={styles.actionsDesktop}>
          {user ? (
            <>
              <Link href="/portal" className={styles.navLink} aria-current={pathname === "/portal" ? "page" : undefined}>
                My account
              </Link>
              <button type="button" onClick={logout} className={styles.logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.navLink}>
                Sign in
              </Link>
              <Link href="/register" className={styles.ctaSecondary} data-magnetic="true">
                Create account
              </Link>
            </>
          )}
          <Link href="/#test-drive" className={styles.cta} data-magnetic="true">
            Book a visit
          </Link>
        </div>
        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className={menuOpen ? styles.burgerOpen : styles.burger} />
        </button>
      </div>
      {menuOpen ? (
        <>
          <button type="button" className={styles.backdrop} aria-label="Close menu" onClick={() => setMenuOpen(false)} />
          <div id="mobile-nav" className={styles.drawer}>
            <nav className={styles.drawerNav} aria-label="Mobile">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={styles.drawerLink}
                  aria-current={activeChapter === href || pathname === href ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Link href="/#test-drive" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
                Book a visit
              </Link>
              {user ? (
                <>
                  <Link href="/portal" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
                    My account
                  </Link>
                  <button type="button" className={styles.drawerBtn} onClick={() => { logout(); setMenuOpen(false); }}>
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
                    Sign in
                  </Link>
                  <Link href="/register" className={styles.drawerCta} onClick={() => setMenuOpen(false)}>
                    Create account
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
