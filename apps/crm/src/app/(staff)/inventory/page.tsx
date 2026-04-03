"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createInventoryItem, getInventory } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

export default function InventoryPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{ items: unknown[] } | null>(null);
  const [vehicleId, setVehicleId] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!token) return;
    getInventory(token)
      .then(setData)
      .catch(() => setData({ items: [] }));
  }, [token]);

  const items = (data?.items ?? []) as {
    id: string;
    vehicleId: string;
    source: string;
    listPrice: number;
    status: string;
    location: string | null;
    vehicle?: { make: string; model: string; year: number };
  }[];

  const refresh = () => {
    if (!token) return;
    getInventory(token)
      .then(setData)
      .catch(() => setData({ items: [] }));
  };

  const onCreate = async () => {
    if (!token || !vehicleId || !listPrice) return;
    await createInventoryItem(token, {
      source: "COMPANY",
      vehicleId,
      listPrice: Number(listPrice),
      location: location || undefined,
    });
    setVehicleId("");
    setListPrice("");
    setLocation("");
    refresh();
  };

  return (
    <main className="crm-shell">
      <h1 className="crm-title" style={{ marginBottom: "0.4rem" }}>Inventory</h1>
      <p className="crm-subtitle" style={{ marginBottom: "1rem" }}>
        Manage from API or <a href={`${API_BASE.replace(/\/$/, "")}/inventory`} target="_blank" rel="noopener noreferrer">API docs</a>.
      </p>
      <div className="crm-panel" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr auto", gap: "0.55rem", marginBottom: "1rem", padding: "0.8rem" }}>
        <input value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} placeholder="Vehicle ID" />
        <input value={listPrice} onChange={(e) => setListPrice(e.target.value)} placeholder="List price" />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
        <button type="button" onClick={onCreate} className="crm-btn crm-btn-primary">Add</button>
      </div>
      <div className="crm-panel" style={{ padding: "0.45rem 0.8rem 0.8rem" }}>
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Source</th>
              <th>Price</th>
              <th>Location</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.vehicle ? `${i.vehicle.make} ${i.vehicle.model} ${i.vehicle.year}` : "—"}</td>
                <td>{i.source}</td>
                <td>${i.listPrice.toLocaleString("en-US")}</td>
                <td>{i.location || "—"}</td>
                <td>{i.status}</td>
                <td>
                  <Link href={`/appraisals/new?vehicleId=${encodeURIComponent(i.vehicleId)}`}>Appraise</Link>
                  {" · "}
                  <a href={`${WEB_URL}/inventory/${i.id}`} target="_blank" rel="noopener noreferrer">View on site</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length === 0 && <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No inventory.</p>}
    </main>
  );
}
