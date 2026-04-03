"use client";

import { useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentTenantBilling, getDashboardStats, getLeads, getOrders } from "@/lib/api";
import { VexPageHeader } from "@vex/ui";

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [recentLeads, setRecentLeads] = useState<unknown[]>([]);
  const [recentOrders, setRecentOrders] = useState<unknown[]>([]);
  const [billingTier, setBillingTier] = useState<string>("STARTER");

  useEffect(() => {
    if (!token) return;
    Promise.all([
      getDashboardStats(token).then(setStats),
      getLeads(token).then((r) => setRecentLeads((r as { items: unknown[] }).items?.slice(0, 5) ?? [])),
      getOrders(token).then((r) => setRecentOrders((r as { items: unknown[] }).items?.slice(0, 5) ?? [])),
      getCurrentTenantBilling(token).then((b) => setBillingTier((b as { billingTier?: string }).billingTier ?? "STARTER")),
    ]).catch(() => {});
  }, [token]);

  const s = stats as { leads?: { new: number; total: number }; orders?: Record<string, number>; inventory?: { available: number } } | null;
  const metricCardStyle: CSSProperties = { padding: "1rem" };

  return (
    <main className="crm-shell">
      <VexPageHeader title="Dashboard" subtitle="Operational snapshot for leads, inventory, and orders." />

      {s && (
        <div className="crm-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", marginBottom: "1.2rem" }}>
          <div className="crm-panel crm-panel-strong" style={metricCardStyle}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>New leads</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}>{s.leads?.new ?? 0}</div>
          </div>
          <div className="crm-panel crm-panel-strong" style={metricCardStyle}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Total leads</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{s.leads?.total ?? 0}</div>
          </div>
          <div className="crm-panel crm-panel-strong" style={metricCardStyle}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Orders (deposit paid)</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{s.orders?.depositPaid ?? 0}</div>
          </div>
          <div className="crm-panel crm-panel-strong" style={metricCardStyle}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Inventory available</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{s.inventory?.available ?? 0}</div>
          </div>
          <div className="crm-panel crm-panel-strong" style={metricCardStyle}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Billing tier</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{billingTier}</div>
            <a
              href={(process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000") + "/portal/subscriptions"}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.82rem", fontWeight: 600 }}
            >
              Upgrade plan →
            </a>
          </div>
        </div>
      )}

      <section className="crm-panel" style={{ marginBottom: "1rem", padding: "1rem" }}>
        <h2 style={{ marginBottom: "0.75rem", fontSize: "1rem", color: "var(--text-primary)" }}>Recent leads</h2>
        <table>
          <thead>
            <tr>
              <th>Contact</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(recentLeads as { id: string; email: string | null; name: string | null; status: string }[]).map((l) => (
              <tr key={l.id}>
                <td>{l.name || l.email || "—"}</td>
                <td>{l.status}</td>
                <td><Link href={`/leads/${l.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {recentLeads.length === 0 && <p style={{ color: "var(--text-muted)" }}>No leads yet.</p>}
        <Link href="/leads" style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>All leads →</Link>
      </section>

      <section className="crm-panel" style={{ padding: "1rem" }}>
        <h2 style={{ marginBottom: "0.75rem", fontSize: "1rem", color: "var(--text-primary)" }}>Recent orders</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(recentOrders as { id: string; status: string }[]).map((o) => (
              <tr key={o.id}>
                <td>{o.id.slice(0, 8)}…</td>
                <td>{o.status}</td>
                <td><Link href={`/orders/${o.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {recentOrders.length === 0 && <p style={{ color: "var(--text-muted)" }}>No orders yet.</p>}
        <Link href="/orders" style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>All orders →</Link>
      </section>
    </main>
  );
}
