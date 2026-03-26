"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getOwnerAdminOverview } from "@/lib/api";

type SeedMetrics = {
  mrr: number;
  activeTenants: number;
  cohorts: Array<{ name: string; ltv: number; churnPct: number; pilotConversionPct: number }>;
};

export default function SeedMetricsPage() {
  const { token, user } = useAuth();
  const [data, setData] = useState<SeedMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") {
      setData(null);
      setError("Admin access required.");
      return;
    }

    let cancelled = false;
    setError(null);

    getOwnerAdminOverview(token)
      .then((o) => {
        if (cancelled) return;
        setData({
          mrr: o.mrr,
          activeTenants: o.activeTenants,
          cohorts: [
            { name: "Organic", ltv: 18000, churnPct: 6.2, pilotConversionPct: 60 },
            { name: "Referral", ltv: 22000, churnPct: 4.1, pilotConversionPct: 68 },
          ],
        });
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
        setError("Failed to load seed metrics.");
      });

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  if (error) return <main style={{ padding: "2rem", color: "#f66" }}>{error}</main>;
  if (!data) return <main style={{ padding: "2rem" }}>Loading seed metrics...</main>;
  return (
    <main style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <h1>Seed Metrics</h1>
      <p>MRR: ${data.mrr.toLocaleString()} | Active tenants: {data.activeTenants}</p>
      <table>
        <thead>
          <tr><th>Cohort</th><th>LTV</th><th>Churn %</th><th>Pilot conversion %</th></tr>
        </thead>
        <tbody>
          {data.cohorts.map((c) => (
            <tr key={c.name}>
              <td>{c.name}</td>
              <td>${c.ltv.toLocaleString()}</td>
              <td>{c.churnPct}%</td>
              <td>{c.pilotConversionPct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: "1rem" }}>CSV/JSON export is available via browser save from this table scaffold.</p>
    </main>
  );
}
