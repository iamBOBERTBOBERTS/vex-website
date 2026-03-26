"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { getAnalytics } from "@/lib/api";
import type { AnalyticsResponse } from "@vex/shared";

export default function AnalyticsPage() {
  const { token, role, loading } = useAuth();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getAnalytics(token)
      .then(setData)
      .catch(() => setErr("Failed to load analytics"));
  }, [token]);

  const leadChartData = data
    ? [
        { name: "New", value: data.leadsByStatus.NEW },
        { name: "Contacted", value: data.leadsByStatus.CONTACTED },
        { name: "Qualified", value: data.leadsByStatus.QUALIFIED },
        { name: "Lost", value: data.leadsByStatus.LOST },
      ]
    : [];

  if (loading) {
    return (
      <main style={{ padding: "1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading analytics…</p>
      </main>
    );
  }
  if (!role || (role !== "STAFF" && role !== "ADMIN")) {
    return (
      <main style={{ padding: "1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <h1>Forbidden</h1>
        <p style={{ color: "var(--text-muted)" }}>Staff or admin role required to view analytics.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link href="/dashboard" style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          ← Dashboard
        </Link>
      </div>
      <h1 style={{ marginBottom: "1.25rem", color: "var(--text-primary)" }}>Analytics</h1>

      {err && <p style={{ color: "#f66" }}>{err}</p>}

      {!data && !err && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}

      {data && (
        <>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ background: "var(--bg-card)", padding: "1rem", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Inventory (available)</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}>{data.inventoryCount}</div>
            </div>
            <div style={{ background: "var(--bg-card)", padding: "1rem", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Leads (total)</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{data.leadsTotal}</div>
            </div>
            <div style={{ background: "var(--bg-card)", padding: "1rem", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Leads converted (qualified)</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{data.leadsConverted}</div>
            </div>
            <div style={{ background: "var(--bg-card)", padding: "1rem", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Revenue (all orders)</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(data.revenueTotal)}
              </div>
            </div>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", marginBottom: "2rem" }}>
            <div style={{ background: "var(--bg-card)", padding: "1rem", borderRadius: "8px", minHeight: 320 }}>
              <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem", color: "var(--text-primary)" }}>Leads by stage</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={leadChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)" }}
                    labelStyle={{ color: "var(--text-primary)" }}
                  />
                  <Bar dataKey="value" fill="var(--accent)" name="Count" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "var(--bg-card)", padding: "1rem", borderRadius: "8px", minHeight: 320 }}>
              <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem", color: "var(--text-primary)" }}>Revenue by month</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.revenueByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)" }}
                    formatter={(v: number) =>
                      new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v)
                    }
                  />
                  <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
