"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getLeads } from "@/lib/api";

export default function LeadsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{ items: unknown[] } | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!token) return;
    getLeads(token, statusFilter ? { status: statusFilter } : undefined)
      .then(setData)
      .catch(() => setData({ items: [] }));
  }, [token, statusFilter]);

  const items = (data?.items ?? []) as { id: string; name: string | null; email: string | null; status: string; vehicleInterest: string | null; assignedTo: { email: string } | null }[];

  return (
    <main style={{ padding: "1.5rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>Leads</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "0.5rem" }}>Status</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="LOST">Lost</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name / Email</th>
            <th>Status</th>
            <th>Interest</th>
            <th>Assigned</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((l) => (
            <tr key={l.id}>
              <td>{l.name || l.email || "—"}</td>
              <td>{l.status}</td>
              <td>{l.vehicleInterest || "—"}</td>
              <td>{l.assignedTo?.email ?? "—"}</td>
              <td><Link href={`/leads/${l.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No leads.</p>}
    </main>
  );
}
