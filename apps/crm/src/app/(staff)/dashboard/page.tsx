"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardStats, getLeads, getOrders } from "@/lib/api";

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [recentLeads, setRecentLeads] = useState<unknown[]>([]);
  const [recentOrders, setRecentOrders] = useState<unknown[]>([]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      getDashboardStats(token).then(setStats),
      getLeads(token).then((r) => setRecentLeads((r as { items: unknown[] }).items?.slice(0, 5) ?? [])),
      getOrders(token).then((r) => setRecentOrders((r as { items: unknown[] }).items?.slice(0, 5) ?? [])),
    ]).catch(() => {});
  }, [token]);

  const s = stats as { leads?: { new: number; total: number }; orders?: Record<string, number>; inventory?: { available: number } } | null;

  return (
    <main style={{ padding: "1.5rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>Dashboard</h1>

      {s && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "var(--bg-card)", padding: "1rem", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>New leads</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}>{s.leads?.new ?? 0}</div>
          </div>
          <div style={{ background: "var(--bg-card)", padding: "1rem", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Total leads</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{s.leads?.total ?? 0}</div>
          </div>
          <div style={{ background: "var(--bg-card)", padding: "1rem", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Orders (deposit paid)</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{s.orders?.depositPaid ?? 0}</div>
          </div>
          <div style={{ background: "var(--bg-card)", padding: "1rem", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Inventory available</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{s.inventory?.available ?? 0}</div>
          </div>
        </div>
      )}

      <section style={{ marginBottom: "2rem" }}>
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
        <Link href="/leads" style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.9rem" }}>All leads →</Link>
      </section>

      <section>
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
        <Link href="/orders" style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.9rem" }}>All orders →</Link>
      </section>
    </main>
  );
}
