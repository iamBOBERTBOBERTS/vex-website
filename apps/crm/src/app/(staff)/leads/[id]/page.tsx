"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getLead, updateLead } from "@/lib/api";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const id = params.id as string;
  const [lead, setLead] = useState<Record<string, unknown> | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    getLead(token, id)
      .then((l) => {
        setLead(l);
        setNotes((l as { notes?: string }).notes ?? "");
        setStatus((l as { status: string }).status ?? "");
      })
      .catch(() => router.replace("/leads"));
  }, [token, id, router]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await updateLead(token, id, { status, notes });
      const updated = await getLead(token, id);
      setLead(updated);
    } finally {
      setSaving(false);
    }
  };

  if (!lead) return <div style={{ padding: "1.5rem" }}>Loading…</div>;

  const l = lead as { name: string | null; email: string | null; phone: string | null; vehicleInterest: string | null; source: string; status: string; notes: string | null; assignedTo: { email: string } | null; createdAt: string };

  return (
    <main style={{ padding: "1.5rem", maxWidth: "640px", margin: "0 auto" }}>
      <Link href="/leads" style={{ display: "inline-block", marginBottom: "1rem" }}>← Leads</Link>
      <h1 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>Lead</h1>
      <p><strong>Name</strong> {l.name || "—"}</p>
      <p><strong>Email</strong> {l.email || "—"}</p>
      <p><strong>Phone</strong> {l.phone || "—"}</p>
      <p><strong>Source</strong> {l.source}</p>
      <p><strong>Vehicle interest</strong> {l.vehicleInterest || "—"}</p>
      <p><strong>Created</strong> {new Date(l.createdAt).toLocaleString()}</p>
      <p><strong>Assigned</strong> {l.assignedTo?.email ?? "—"}</p>

      <div style={{ marginTop: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.35rem" }}>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="LOST">Lost</option>
        </select>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.35rem" }}>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} style={{ width: "100%", background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "4px", padding: "0.5rem", color: "var(--text-primary)" }} />
      </div>
      <button type="button" onClick={handleSave} disabled={saving} style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "var(--accent)", color: "#0d0d0d", border: "none", borderRadius: "6px", fontWeight: 600 }}>
        {saving ? "Saving…" : "Save"}
      </button>
    </main>
  );
}
