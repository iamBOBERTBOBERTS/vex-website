"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getInventory, type InventoryItem } from "@/lib/api";
import { formatUsd } from "@/lib/formatCurrency";
import { ImmersiveVehicleCard } from "@/components/ImmersiveVehicleCard";
import styles from "./FeaturedInventory.module.css";

function imageUrl(item: InventoryItem): string | null {
  const urls = item.imageUrls ?? item.vehicle?.imageUrls;
  if (Array.isArray(urls) && urls[0]) return urls[0];
  return null;
}

export function FeaturedInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInventory({ limit: 6, offset: 0 })
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="featured" className={styles.section}>
        <h2 className={styles.title}>Featured cars</h2>
        <p className={styles.subtitle}>Current listings on the exchange</p>
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.cardSkeleton} />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section id="featured" className={styles.section}>
      <h2 className={styles.title}>Featured cars</h2>
      <p className={styles.subtitle}>Current listings on the exchange</p>
      <div className={styles.grid}>
        {items.map((item, index) => {
          const url = imageUrl(item);
          const lot = String(index + 1).padStart(3, "0");
          return (
            <ImmersiveVehicleCard
              key={item.id}
              inventoryId={item.id}
              href={`/inventory/${item.id}`}
              imageUrl={url}
              lotTag={`LOT · ${lot}`}
              badge={item.source === "PRIVATE_SELLER" ? "Private" : "Company"}
              badges={["Verified history", "Enclosed shipping"]}
              title={`${item.vehicle?.make ?? ""} ${item.vehicle?.model ?? ""}`.trim()}
              meta={`${item.vehicle?.year ?? ""}${item.location ? ` · ${item.location}` : ""}`.trim()}
              price={formatUsd(item.listPrice)}
              cta="View details"
              className={styles.card}
              imageClassName={styles.cardImage}
            />
          );
        })}
      </div>
      <Link href="/inventory" className={styles.viewAll}>
        See all cars →
      </Link>
    </section>
  );
}
