"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createLead, getLeads } from "@/lib/api";
import { PremiumMicroInteractionWrapper, VexDataTable, VexPageHeader, VexPanel, VexTrustBadge } from "@vex/ui";

export default function LeadsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{ items: unknown[] } | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");

  useEffect(() => {
    if (!token) return;
    getLeads(token, statusFilter ? { status: statusFilter } : undefined)
      .then(setData)
      .catch(() => setData({ items: [] }));
  }, [token, statusFilter]);

  const items = (data?.items ?? []) as { id: string; name: string | null; email: string | null; status: string; vehicleInterest: string | null; assignedTo: { email: string } | null }[];

  const refresh = () => {
    if (!token) return;
    getLeads(token, statusFilter ? { status: statusFilter } : undefined)
      .then(setData)
      .catch(() => setData({ items: [] }));
  };

  const onCreateLead = async () => {
    if (!token) return;
    await createLead(token, { name: leadName || undefined, email: leadEmail || undefined, source: "CRM" });
    setLeadName("");
    setLeadEmail("");
    refresh();
  };

  return (
    <main className="crm-shell">
      <VexPageHeader
        title="Leads"
        subtitle="Pipeline visibility with premium handoff context."
        action={<Link href="/leads/new" className="crm-btn crm-btn-primary">Add lead</Link>}
      />
      <VexPanel style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.5rem", marginBottom: "1rem", padding: "0.8rem" }}>
        <input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Lead name" />
        <input value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="Lead email" />
        <button type="button" onClick={onCreateLead} className="crm-btn crm-btn-primary">Quick add</button>
      </VexPanel>
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
      <VexDataTable>
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
              <td><VexTrustBadge>{l.status}</VexTrustBadge></td>
              <td>{l.vehicleInterest || "—"}</td>
              <td>{l.assignedTo?.email ?? "—"} <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>entered the universe moments ago</span></td>
              <td><PremiumMicroInteractionWrapper><Link href={`/leads/${l.id}`}>View</Link></PremiumMicroInteractionWrapper></td>
            </tr>
          ))}
        </tbody>
      </VexDataTable>
      {items.length === 0 && <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No leads.</p>}
    </main>
  );
}
