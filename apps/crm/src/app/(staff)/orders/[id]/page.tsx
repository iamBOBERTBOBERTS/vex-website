"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getOrder, updateOrderStatus } from "@/lib/api";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const id = params.id as string;
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    getOrder(token, id)
      .then((o) => {
        setOrder(o);
        setStatus((o as { status: string }).status);
      })
      .catch(() => router.replace("/orders"));
  }, [token, id, router]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await updateOrderStatus(token, id, status);
      const updated = await getOrder(token, id);
      setOrder(updated);
    } finally {
      setSaving(false);
    }
  };

  if (!order) return <div style={{ padding: "1.5rem" }}>Loading…</div>;

  const o = order as { type: string; status: string; totalAmount: number | null; depositAmount: number | null; configSnapshot: unknown; financingSnapshot: unknown; shippingSnapshot: unknown; createdAt: string; shipments?: { status: string; trackingUrl: string | null }[] };

  return (
    <main style={{ padding: "1.5rem", maxWidth: "640px", margin: "0 auto" }}>
      <Link href="/orders" style={{ display: "inline-block", marginBottom: "1rem" }}>← Orders</Link>
      <h1 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>Order {id.slice(0, 8)}…</h1>
      <p><strong>Type</strong> {o.type}</p>
      <p><strong>Total</strong> {o.totalAmount != null ? `£${o.totalAmount.toLocaleString()}` : "—"}</p>
      <p><strong>Deposit</strong> {o.depositAmount != null ? `£${o.depositAmount.toLocaleString()}` : "—"}</p>
      <p><strong>Created</strong> {new Date(o.createdAt).toLocaleString()}</p>
      {o.shipments && o.shipments.length > 0 && (
        <p><strong>Shipment</strong> {o.shipments[0].status} {o.shipments[0].trackingUrl && <a href={o.shipments[0].trackingUrl} target="_blank" rel="noopener noreferrer">Track</a>}</p>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.35rem" }}>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="DRAFT">Draft</option>
          <option value="DEPOSIT_PAID">Deposit paid</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="FULFILLED">Fulfilled</option>
        </select>
      </div>
      <button type="button" onClick={handleSave} disabled={saving} style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "var(--accent)", color: "#0d0d0d", border: "none", borderRadius: "6px", fontWeight: 600 }}>
        {saving ? "Saving…" : "Update status"}
      </button>
    </main>
  );
}
