"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createCustomer, getCustomers } from "@/lib/api";
import { VexDataTable, VexPageHeader, VexPanel } from "@vex/ui";

export default function CustomersPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{ items: unknown[] } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!token) return;
    getCustomers(token)
      .then(setData)
      .catch(() => setData({ items: [] }));
  }, [token]);

  const items = (data?.items ?? []) as { id: string; email: string; name: string | null; phone: string | null; tier: string | null; createdAt: string }[];

  const refresh = () => {
    if (!token) return;
    getCustomers(token)
      .then(setData)
      .catch(() => setData({ items: [] }));
  };

  const onCreate = async () => {
    if (!token) return;
    await createCustomer(token, { name: name || undefined, email: email || undefined, phone: phone || undefined });
    setName("");
    setEmail("");
    setPhone("");
    refresh();
  };

  return (
    <main className="crm-shell">
      <VexPageHeader title="Customers" subtitle="Trusted relationships across your VEX universe." />
      <VexPanel style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0.5rem", marginBottom: "1rem", padding: "0.8rem" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
        <button type="button" onClick={onCreate} className="crm-btn crm-btn-primary">Add</button>
      </VexPanel>
      <VexDataTable>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Tier</th>
            <th>Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td>{c.name || "—"}</td>
              <td>{c.email}</td>
              <td>{c.phone || "—"}</td>
              <td>{c.tier || "—"}</td>
              <td>{new Date(c.createdAt).toLocaleDateString()}</td>
              <td><Link href={`/customers/${c.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </VexDataTable>
      {items.length === 0 && <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No customers.</p>}
    </main>
  );
}
