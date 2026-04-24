"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  addAppraisalToInventory,
  createInventoryItem,
  getInventory,
  getMarketListings,
  listAppraisals,
  type MarketListing,
} from "@/lib/api";
import { getCrmWebBase } from "@/lib/runtimeConfig";

const WEB_URL = getCrmWebBase();

type InventoryItem = {
  id: string;
  vehicleId: string;
  source: string;
  listPrice: number;
  status: string;
  location: string | null;
  vehicle?: { make: string; model: string; year: number } | null;
};

type PendingAppraisal = {
  id: string;
  value: number | null;
  status: string;
  createdAt: string;
};

export default function InventoryPage() {
  const { token } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [marketItems, setMarketItems] = useState<MarketListing[]>([]);
  const [pendingAppraisals, setPendingAppraisals] = useState<PendingAppraisal[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [location, setLocation] = useState("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const authToken = token;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [inventoryData, appraisalData, marketData] = await Promise.all([
          getInventory(authToken).catch(() => ({ items: [] })),
          listAppraisals(authToken).catch(() => ({ items: [] })),
          getMarketListings({ limit: 12 }).catch(() => ({ items: [] as MarketListing[], total: 0, limit: 12, offset: 0 })),
        ]);

        if (cancelled) return;

        setInventory((inventoryData.items ?? []) as InventoryItem[]);
        setMarketItems((marketData.items ?? []) as MarketListing[]);
        setPendingAppraisals(
          ((appraisalData.items ?? []) as PendingAppraisal[])
            .filter((item) => String(item.status).toLowerCase() !== "closed")
            .slice(0, 8)
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const openInventoryCount = useMemo(
    () => inventory.filter((item) => String(item.status).toLowerCase() !== "sold").length,
    [inventory]
  );

  const refreshInventory = async () => {
    if (!token) return;
    const authToken = token;
    const [inventoryData, appraisalData] = await Promise.all([
      getInventory(authToken).catch(() => ({ items: [] })),
      listAppraisals(authToken).catch(() => ({ items: [] })),
    ]);

    setInventory((inventoryData.items ?? []) as InventoryItem[]);
    setPendingAppraisals(
      ((appraisalData.items ?? []) as PendingAppraisal[])
        .filter((item) => String(item.status).toLowerCase() !== "closed")
        .slice(0, 8)
    );
  };

  const onCreate = async () => {
    if (!token || !vehicleId || !listPrice) return;
    const authToken = token;

    setActionMsg(null);

    try {
      await createInventoryItem(authToken, {
        source: "COMPANY",
        vehicleId,
        listPrice: Number(listPrice),
        location: location || undefined,
      });

      setVehicleId("");
      setListPrice("");
      setLocation("");
      setActionMsg("Inventory item created successfully.");
      await refreshInventory();
    } catch (error) {
      setActionMsg(error instanceof Error ? error.message : "Failed to create inventory item.");
    }
  };

  const onAddFromAppraisal = async (appraisalId: string, appraisalValue: number | null) => {
    if (!token) return;
    const authToken = token;

    setActionMsg(null);

    try {
      const result = await addAppraisalToInventory(authToken, appraisalId, {
        listPrice: appraisalValue ?? undefined,
      });

      setActionMsg(
        `Added appraisal ${appraisalId.slice(0, 8)} to inventory (${String(result.inventoryId).slice(0, 8)}).`
      );
      await refreshInventory();
    } catch (error) {
      setActionMsg(error instanceof Error ? error.message : "Failed to add appraisal to inventory.");
    }
  };

  return (
    <main className="crm-shell">
      <h1 className="crm-title" style={{ marginBottom: "0.4rem" }}>
        Inventory
      </h1>
      <p className="crm-subtitle" style={{ marginBottom: "1rem" }}>
        Manage dealer inventory, convert fresh appraisals into listings, and monitor market comps alongside the public
        website experience.
      </p>

      <div className="crm-panel" style={{ marginBottom: "1rem", padding: "1rem", display: "grid", gap: "1rem" }}>
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <div>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>Active inventory</p>
            <p style={{ color: "var(--text-primary)", fontSize: "1.5rem", margin: "0.35rem 0 0" }}>{openInventoryCount}</p>
          </div>
          <div>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>Open appraisals</p>
            <p style={{ color: "var(--text-primary)", fontSize: "1.5rem", margin: "0.35rem 0 0" }}>
              {pendingAppraisals.length}
            </p>
          </div>
          <div>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>Market comps loaded</p>
            <p style={{ color: "var(--text-primary)", fontSize: "1.5rem", margin: "0.35rem 0 0" }}>{marketItems.length}</p>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <a href={`${WEB_URL}/inventory`} target="_blank" rel="noopener noreferrer" className="crm-btn crm-btn-primary">
            Open website inventory
          </a>
          <Link href="/appraisals/new" className="crm-btn">
            New appraisal
          </Link>
        </div>
      </div>

      <div
        className="crm-panel"
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr auto",
          gap: "0.55rem",
          marginBottom: "1rem",
          padding: "0.8rem",
        }}
      >
        <input value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} placeholder="Vehicle ID" />
        <input value={listPrice} onChange={(event) => setListPrice(event.target.value)} placeholder="List price" />
        <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" />
        <button type="button" onClick={() => void onCreate()} className="crm-btn crm-btn-primary">
          Add
        </button>
      </div>

      <div className="crm-panel" style={{ marginBottom: "1rem", padding: "0.8rem" }}>
        <h2 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "1rem" }}>Add from appraisal</h2>
        <p style={{ color: "var(--text-muted)", margin: 0, marginBottom: "0.7rem" }}>
          Turn incoming trade-ins into inventory with one click.
        </p>
        <div style={{ display: "grid", gap: "0.45rem" }}>
          {pendingAppraisals.map((appraisal) => (
            <div
              key={appraisal.id}
              style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.6rem", alignItems: "center" }}
            >
              <span style={{ color: "var(--text-muted)" }}>
                {appraisal.id.slice(0, 8)} · {String(appraisal.status).toUpperCase()} ·{" "}
                {appraisal.value != null ? `$${appraisal.value.toLocaleString("en-US")}` : "No value"}
              </span>
              <Link href={`/appraisals/${appraisal.id}`}>Open</Link>
              <button
                type="button"
                className="crm-btn"
                onClick={() => void onAddFromAppraisal(appraisal.id, appraisal.value)}
              >
                Add to inventory
              </button>
            </div>
          ))}
          {!pendingAppraisals.length && (
            <span style={{ color: "var(--text-muted)" }}>No open appraisals are ready to import.</span>
          )}
        </div>
      </div>

      {actionMsg ? (
        <p
          style={{
            marginBottom: "0.7rem",
            color: actionMsg.toLowerCase().includes("failed") ? "#ff6b6b" : "#7fffd4",
          }}
        >
          {actionMsg}
        </p>
      ) : null}

      <div className="crm-panel" style={{ padding: "0.45rem 0.8rem 0.8rem" }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Internal inventory</h2>
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
            {inventory.map((item) => (
              <tr key={item.id}>
                <td>{item.vehicle ? `${item.vehicle.make} ${item.vehicle.model} ${item.vehicle.year}` : "—"}</td>
                <td>{item.source}</td>
                <td>${item.listPrice.toLocaleString("en-US")}</td>
                <td>{item.location || "—"}</td>
                <td>{item.status}</td>
                <td>
                  <Link href={`/appraisals/new?vehicleId=${encodeURIComponent(item.vehicleId)}`}>Appraise</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!inventory.length && !loading ? (
          <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No inventory items yet.</p>
        ) : null}
      </div>

      <div className="crm-panel" style={{ marginTop: "1rem", padding: "0.45rem 0.8rem 0.8rem" }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Market listings</h2>
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Source</th>
              <th>Price</th>
              <th>Location</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {marketItems.map((item) => (
              <tr key={item.id}>
                <td>{`${item.make} ${item.model} ${item.year}`}</td>
                <td>{item.source}</td>
                <td>{item.price != null ? `$${item.price.toLocaleString("en-US")}` : "—"}</td>
                <td>{item.location || "—"}</td>
                <td>
                  <a href={item.externalUrl} target="_blank" rel="noopener noreferrer">
                    View listing
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!marketItems.length && !loading ? (
          <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No market listings are available.</p>
        ) : null}
      </div>
    </main>
  );
}
