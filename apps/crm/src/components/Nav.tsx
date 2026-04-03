"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function Nav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/appraisals", label: "Appraisals" },
    { href: "/analytics", label: "Analytics" },
    { href: "/autonomous", label: "Autonomous" },
    { href: "/leads", label: "Leads" },
    { href: "/orders", label: "Orders" },
    { href: "/inventory", label: "Inventory" },
    { href: "/customers", label: "Customers" },
  ];

  return (
    <header className="crm-nav">
      <div
        className="crm-shell"
        style={{ marginTop: "0.75rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}
      >
        <nav style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{ fontWeight: 800, color: "var(--text-primary)", letterSpacing: "0.03em" }}>
            VEX CRM
          </Link>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                color: pathname?.startsWith(href) ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: "0.86rem",
                border: pathname?.startsWith(href) ? "1px solid var(--line)" : "1px solid transparent",
                background: pathname?.startsWith(href) ? "var(--accent-soft)" : "transparent",
                borderRadius: "999px",
                padding: "0.32rem 0.65rem",
                fontWeight: pathname?.startsWith(href) ? 600 : 500,
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          style={{ background: "transparent", border: "1px solid var(--line)", borderRadius: "10px", color: "var(--text-muted)", fontSize: "0.86rem", padding: "0.4rem 0.7rem" }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
