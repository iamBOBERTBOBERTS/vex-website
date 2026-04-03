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
import { VexChartShell, VexMetricCard, VexPageHeader, VexPanel } from "@vex/ui";

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
      <main className="crm-shell">
        <VexPanel style={{ padding: "1rem" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading analytics...</p>
        </VexPanel>
      </main>
    );
  }
  if (!role || (role !== "STAFF" && role !== "ADMIN")) {
    return (
      <main className="crm-shell">
        <h1>Forbidden</h1>
        <p style={{ color: "var(--text-muted)" }}>Staff or admin role required to view analytics.</p>
      </main>
    );
  }

  return (
    <main className="crm-shell">
      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link href="/dashboard" style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          ← Dashboard
        </Link>
      </div>
      <VexPageHeader title="Analytics" subtitle="Live performance and pipeline telemetry." />

      {err && <p style={{ color: "#f66" }}>{err}</p>}

      {!data && !err && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}

      {data && (
        <>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "1rem", marginBottom: "1.2rem" }}>
            <VexMetricCard label="Inventory (available)" value={data.inventoryCount} />
            <VexMetricCard label="Leads (total)" value={data.leadsTotal} />
            <VexMetricCard label="Leads converted (qualified)" value={data.leadsConverted} />
            <VexMetricCard
              label="Revenue (all orders)"
              value={new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(data.revenueTotal)}
            />
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginBottom: "1.4rem" }}>
            <VexChartShell title="Leads by stage">
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
            </VexChartShell>

            <VexChartShell title="Revenue by month">
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
            </VexChartShell>
          </div>
        </>
      )}
    </main>
  );
}
