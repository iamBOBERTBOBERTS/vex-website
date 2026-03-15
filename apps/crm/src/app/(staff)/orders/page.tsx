"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getOrders } from "@/lib/api";

export default function OrdersPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{ items: unknown[] } | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!token) return;
    getOrders(token, statusFilter ? { status: statusFilter } : undefined)
      .then(setData)
      .catch(() => setData({ items: [] }));
  }, [token, statusFilter]);

  const items = (data?.items ?? []) as { id: string; type: string; status: string; totalAmount: number | null; createdAt: string }[];

  return (
    <main style={{ padding: "1.5rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>Orders</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "0.5rem" }}>Status</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="DRAFT">Draft</option>
          <option value="DEPOSIT_PAID">Deposit paid</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="FULFILLED">Fulfilled</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Status</th>
            <th>Total</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id}>
              <td>{o.id.slice(0, 8)}…</td>
              <td>{o.type}</td>
              <td>{o.status}</td>
              <td>{o.totalAmount != null ? `£${o.totalAmount.toLocaleString()}` : "—"}</td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td><Link href={`/orders/${o.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No orders.</p>}
    </main>
  );
}
