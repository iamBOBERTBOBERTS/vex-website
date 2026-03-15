"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getInventory } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

export default function InventoryPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{ items: unknown[] } | null>(null);

  useEffect(() => {
    if (!token) return;
    getInventory(token)
      .then(setData)
      .catch(() => setData({ items: [] }));
  }, [token]);

  const items = (data?.items ?? []) as { id: string; source: string; listPrice: number; status: string; location: string | null; vehicle?: { make: string; model: string; year: number } }[];

  return (
    <main style={{ padding: "1.5rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>Inventory</h1>
      <p style={{ marginBottom: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
        Manage from API or <a href={`${API_BASE.replace(/\/$/, "")}/inventory`} target="_blank" rel="noopener noreferrer">API docs</a>. Add/edit via CRM coming soon.
      </p>
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
              <td>£{i.listPrice.toLocaleString()}</td>
              <td>{i.location || "—"}</td>
              <td>{i.status}</td>
              <td><a href={`${WEB_URL}/inventory/${i.id}`} target="_blank" rel="noopener noreferrer">View on site</a></td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No inventory.</p>}
    </main>
  );
}
