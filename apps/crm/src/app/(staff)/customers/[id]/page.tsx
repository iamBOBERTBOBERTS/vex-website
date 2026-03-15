"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getCustomer } from "@/lib/api";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const id = params.id as string;
  const [customer, setCustomer] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!token) return;
    getCustomer(token, id)
      .then(setCustomer)
      .catch(() => router.replace("/customers"));
  }, [token, id, router]);

  if (!customer) return <div style={{ padding: "1.5rem" }}>Loading…</div>;

  const c = customer as { email: string; name: string | null; phone: string | null; tier: string | null; createdAt: string; orders?: { id: string; type: string; status: string; totalAmount: number | null }[]; leads?: { id: string; status: string; vehicleInterest: string | null }[] };

  return (
    <main style={{ padding: "1.5rem", maxWidth: "640px", margin: "0 auto" }}>
      <Link href="/customers" style={{ display: "inline-block", marginBottom: "1rem" }}>← Customers</Link>
      <h1 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>Customer</h1>
      <p><strong>Name</strong> {c.name || "—"}</p>
      <p><strong>Email</strong> {c.email}</p>
      <p><strong>Phone</strong> {c.phone || "—"}</p>
      <p><strong>Tier</strong> {c.tier || "—"}</p>
      <p><strong>Joined</strong> {new Date(c.createdAt).toLocaleString()}</p>

      {c.orders && c.orders.length > 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Orders</h2>
          <ul style={{ listStyle: "none" }}>
            {c.orders.map((o) => (
              <li key={o.id}><Link href={`/orders/${o.id}`}>{o.id.slice(0, 8)}…</Link> — {o.status} — {o.totalAmount != null ? `£${o.totalAmount.toLocaleString()}` : "—"}</li>
            ))}
          </ul>
        </section>
      )}

      {c.leads && c.leads.length > 0 && (
        <section style={{ marginTop: "1rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Leads</h2>
          <ul style={{ listStyle: "none" }}>
            {c.leads.map((l) => (
              <li key={l.id}><Link href={`/leads/${l.id}`}>{l.status}</Link> — {l.vehicleInterest || "—"}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
