"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { listAppraisals } from "@/lib/api";
import type { AppraisalOutput } from "@vex/shared";
import { useQuery } from "@tanstack/react-query";

function vehicleLabel(a: AppraisalOutput) {
  if (a.vehicle) return `${a.vehicle.year} ${a.vehicle.make} ${a.vehicle.model}`;
  if (a.notes) {
    try {
      const j = JSON.parse(a.notes) as { make?: string; model?: string; year?: number };
      if (j.make && j.model) return `${j.year ?? ""} ${j.make} ${j.model}`.trim();
    } catch {
      return a.notes.slice(0, 48) + (a.notes.length > 48 ? "…" : "");
    }
  }
  return "—";
}

export function AppraisalsClient() {
  const { token, role, loading } = useAuth();
  const { data, error, isLoading } = useQuery({
    queryKey: ["appraisals", token],
    queryFn: async () => {
      if (!token) return { items: [] as AppraisalOutput[] };
      const r = await listAppraisals(token);
      return r;
    },
    enabled: !!token,
  });

  const items = data?.items ?? [];
  const err = error ? "Failed to load appraisals" : null;

  if (loading) {
    return (
      <main style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading appraisals…</p>
      </main>
    );
  }
  if (!role || (role !== "STAFF" && role !== "ADMIN")) {
    return (
      <main style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1>Forbidden</h1>
        <p style={{ color: "var(--text-muted)" }}>Staff or admin role required to view appraisals.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ color: "var(--text-primary)" }}>Appraisals</h1>
        <Link
          href="/appraisals/new"
          style={{
            padding: "0.5rem 1rem",
            background: "var(--accent)",
            color: "#111",
            borderRadius: "6px",
            fontWeight: 600,
          }}
        >
          New appraisal
        </Link>
      </div>
      {isLoading && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}
      {err && <p style={{ color: "#f66" }}>{err}</p>}
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Customer</th>
              <th>Value</th>
              <th>Status</th>
              <th>Date</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{vehicleLabel(a)}</td>
                <td>{a.customer ? a.customer.name ?? a.customer.email ?? "—" : "—"}</td>
                <td>{a.value != null ? `$${a.value.toLocaleString()}` : "—"}</td>
                <td>{a.status}</td>
                <td>{new Date(a.createdAt).toLocaleString()}</td>
                <td>
                  <Link href={`/appraisals/${a.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !err && !isLoading && (
          <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No appraisals yet.</p>
        )}
      </div>
    </main>
  );
}
