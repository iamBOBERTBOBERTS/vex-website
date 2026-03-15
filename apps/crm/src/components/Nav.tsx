"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function Nav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/leads", label: "Leads" },
    { href: "/orders", label: "Orders" },
    { href: "/inventory", label: "Inventory" },
    { href: "/customers", label: "Customers" },
  ];

  return (
    <header style={{ background: "var(--bg-card)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Link href="/dashboard" style={{ fontWeight: 700, color: "var(--text-primary)" }}>VEX CRM</Link>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{ color: pathname?.startsWith(href) ? "var(--accent)" : "var(--text-secondary)", fontSize: "0.9rem" }}
          >
            {label}
          </Link>
        ))}
      </nav>
      <button type="button" onClick={logout} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.9rem", cursor: "pointer" }}>
        Sign out
      </button>
    </header>
  );
}
