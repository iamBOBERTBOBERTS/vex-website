"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { href: "/inventory", label: "Inventory" },
  { href: "/build", label: "Build Your Ride" },
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <Link href="/" className={styles.logo}>
        {!logoError ? (
          <Image
            src="/vex-logo.png"
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
      <nav className={styles.nav}>
        {NAV_LINKS.map(({ href, label }) => (
          <Link key={href} href={href} className={styles.navLink}>
            {label}
          </Link>
        ))}
      </nav>
      <div className={styles.actions}>
        {user ? (
          <>
            <Link href="/portal" className={styles.navLink}>Portal</Link>
            <button type="button" onClick={logout} className={styles.logout}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={styles.navLink}>Sign in</Link>
            <Link href="/register" className={styles.ctaSecondary}>Register</Link>
          </>
        )}
        <Link href="/#test-drive" className={styles.cta}>
          Book a Test Drive
        </Link>
      </div>
    </header>
  );
}
