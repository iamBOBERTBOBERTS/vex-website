"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { getInventory, type InventoryItem, type GetInventoryParams } from "@/lib/api";
import { formatUsd } from "@/lib/formatCurrency";
import { ImmersiveVehicleCard } from "@/components/ImmersiveVehicleCard";
import styles from "./inventory.module.css";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<GetInventoryParams>({
    limit: 20,
    offset: 0,
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getInventory(filters)
      .then((data) => {
        if (!cancelled) {
          setItems(data.items);
          setTotal(data.total);
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters.source, filters.location, filters.minPrice, filters.maxPrice, filters.make, filters.model, filters.year, filters.limit, filters.offset]);

  const applyFilters = (next: Partial<GetInventoryParams>) => {
    setFilters((prev) => ({ ...prev, ...next, offset: 0 }));
  };

  const imageUrl = (item: InventoryItem) => {
    const urls = item.imageUrls ?? item.vehicle?.imageUrls;
    if (Array.isArray(urls) && urls[0]) return urls[0];
    return null;
  };

  return (
    <>
      <Header />
      <main id="main-content" className={styles.main}>
        <div className={styles.top}>
          <h1 className={styles.title}>Browse cars</h1>
          <p className={styles.subtitle}>Tap a car to see details, photos, and price.</p>
        </div>

        <aside className={styles.filters}>
          <h2 className={styles.filterTitle}>Narrow results</h2>
          <label className={styles.label}>
            Seller
            <select
              value={filters.source ?? ""}
              onChange={(e) => applyFilters({ source: e.target.value || undefined })}
              className={styles.select}
            >
              <option value="">All</option>
              <option value="COMPANY">Company</option>
              <option value="PRIVATE_SELLER">Private seller</option>
            </select>
          </label>
          <label className={styles.label}>
            Location
            <input
              type="text"
              placeholder="City or region"
              value={filters.location ?? ""}
              onChange={(e) => applyFilters({ location: e.target.value || undefined })}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Min price (USD)
            <input
              type="number"
              min={0}
              placeholder="0"
              value={filters.minPrice ?? ""}
              onChange={(e) => applyFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Max price (USD)
            <input
              type="number"
              min={0}
              placeholder="Any"
              value={filters.maxPrice ?? ""}
              onChange={(e) => applyFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Make
            <input
              type="text"
              placeholder="e.g. Ferrari"
              value={filters.make ?? ""}
              onChange={(e) => applyFilters({ make: e.target.value || undefined })}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Model
            <input
              type="text"
              placeholder="e.g. 488"
              value={filters.model ?? ""}
              onChange={(e) => applyFilters({ model: e.target.value || undefined })}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Year
            <input
              type="number"
              min={1990}
              max={2030}
              placeholder="e.g. 2023"
              value={filters.year ?? ""}
              onChange={(e) => applyFilters({ year: e.target.value ? Number(e.target.value) : undefined })}
              className={styles.input}
            />
          </label>
        </aside>

        <section className={styles.gridSection}>
          {loading ? (
            <p className={styles.loading}>Loading…</p>
          ) : items.length === 0 ? (
            <p className={styles.empty}>No vehicles match your filters.</p>
          ) : (
            <>
              <p className={styles.count}>{total} vehicle{total !== 1 ? "s" : ""} found</p>
              <div className={styles.grid}>
                {items.map((item) => (
                  <ImmersiveVehicleCard
                    key={item.id}
                    inventoryId={item.id}
                    href={`/inventory/${item.id}`}
                    imageUrl={imageUrl(item)}
                    badge={item.source === "PRIVATE_SELLER" ? "Private" : "Company"}
                    badges={["Verified history", "Enclosed shipping"]}
                    title={`${item.vehicle?.make ?? ""} ${item.vehicle?.model ?? ""}`.trim()}
                    meta={`${item.vehicle?.year ?? ""}${item.location ? ` · ${item.location}` : ""}`.trim()}
                    price={formatUsd(item.listPrice)}
                    cta="View details"
                    className={styles.card}
                    imageClassName={styles.cardImage}
                  />
                ))}
              </div>
              {items.length < total ? (
                <button
                  type="button"
                  className={styles.loadMore}
                  onClick={() => setFilters((prev) => ({ ...prev, limit: Math.min((prev.limit ?? 20) + 12, 96) }))}
                >
                  Load more vehicles
                </button>
              ) : null}
            </>
          )}
        </section>
      </main>
    </>
  );
}
