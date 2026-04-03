"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createOrder, getOrders } from "@/lib/api";
import { VexDataTable, VexPageHeader, VexPanel, VexTrustBadge } from "@vex/ui";

export default function OrdersPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{ items: unknown[] } | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [inventoryId, setInventoryId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  useEffect(() => {
    if (!token) return;
    getOrders(token, statusFilter ? { status: statusFilter } : undefined)
      .then(setData)
      .catch(() => setData({ items: [] }));
  }, [token, statusFilter]);

  const items = (data?.items ?? []) as { id: string; type: string; status: string; totalAmount: number | null; createdAt: string }[];

  const refresh = () => {
    if (!token) return;
    getOrders(token, statusFilter ? { status: statusFilter } : undefined)
      .then(setData)
      .catch(() => setData({ items: [] }));
  };

  const onCreate = async () => {
    if (!token) return;
    await createOrder(token, {
      type: "INVENTORY",
      ...(inventoryId ? { inventoryId } : {}),
      ...(totalAmount ? { totalAmount: Number(totalAmount) } : {}),
    });
    setInventoryId("");
    setTotalAmount("");
    refresh();
  };

  return (
    <main className="crm-shell">
      <VexPageHeader title="Orders" subtitle="Deal-flow milestones with concierge confidence." />
      <VexPanel style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr auto", gap: "0.5rem", marginBottom: "1rem", padding: "0.8rem" }}>
        <input value={inventoryId} onChange={(e) => setInventoryId(e.target.value)} placeholder="Inventory ID (optional)" />
        <input value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="Total amount" />
        <button type="button" onClick={onCreate} className="crm-btn crm-btn-primary">Create</button>
      </VexPanel>
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
      <VexDataTable>
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
              <td><VexTrustBadge>{o.status}</VexTrustBadge></td>
              <td>{o.totalAmount != null ? `$${o.totalAmount.toLocaleString("en-US")}` : "—"}</td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td><Link href={`/orders/${o.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </VexDataTable>
      {items.length === 0 && <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No orders.</p>}
    </main>
  );
}
