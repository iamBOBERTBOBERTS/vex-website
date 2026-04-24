"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const NAV_LINKS = [
  { href: "/inventory", label: "Inventory" },
  { href: "/how-it-works", label: "Experience" },
  { href: "/sell", label: "Sell" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition ${scrolled ? "pt-3" : "pt-4"}`}
    >
      <div className="shell pb-3">
        <div className="luxury-nav-bar flex items-center justify-between gap-4 px-3 py-3 sm:px-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f1d38a]/24 bg-white/[0.06] text-xs font-semibold tracking-[0.2em] text-[#f1d38a] shadow-[0_0_48px_rgba(212,175,55,0.08)]">
            VX
          </span>
          <span>
            <span className="block text-xs uppercase tracking-[0.32em] text-[#f1d38a]">VEX Atelier</span>
            <span className="block text-xs text-[#bcae97]">Private market luxury platform</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-3 py-2 text-xs uppercase tracking-[0.16em] transition ${
                  active ? "bg-white/[0.07] text-[#fff8eb]" : "text-[#d6ccbd]/72 hover:bg-white/[0.04] hover:text-[#f1d38a]"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/appraisal" className="hidden rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#f5f1e8] transition hover:border-[#f1d38a]/28 hover:bg-white/[0.08] lg:inline-flex">
            Request Appraisal
          </Link>
          <Link href="/contact" className="gold-button hidden sm:inline-flex">
            Private Access
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-[#f5f1e8] md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="space-y-1.5">
              <span className={`block h-0.5 w-4 bg-current transition ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-4 bg-current transition ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-4 bg-current transition ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-x-5 top-24 rounded-[2rem] border border-[#f1d38a]/16 bg-[#111111]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
            >
              <p className="text-xs uppercase tracking-[0.32em] text-[#f1d38a]/70">Navigate the estate</p>
              <div className="mt-5 grid gap-3">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[#f5f1e8]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-5 grid gap-3">
                <Link href="/appraisal" className="ghost-button" onClick={() => setMenuOpen(false)}>
                  Start Appraisal
                </Link>
                <Link href="/contact" className="gold-button" onClick={() => setMenuOpen(false)}>
                  Reserve Concierge
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
