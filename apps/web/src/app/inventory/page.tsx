"use client";

import { useMemo, useState } from "react";
import { FEATURED_VEHICLES } from "@/lib/vehicles";
import { VehicleCard } from "@/components/VehicleCard";
import styles from "./inventory.module.css";

const priceRanges = [
  { label: "All price bands", value: "all" },
  { label: "Under $300k", value: "under-300" },
  { label: "$300k - $500k", value: "300-500" },
  { label: "$500k+", value: "500-plus" },
];

const mileageRanges = [
  { label: "All mileage", value: "all" },
  { label: "Under 1,000 mi", value: "under-1000" },
  { label: "1,000 - 2,500 mi", value: "1000-2500" },
  { label: "2,500+ mi", value: "2500-plus" },
];

const sortOptions = [
  { label: "Newest arrivals", value: "newest" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
];

export default function InventoryPage() {
  const [make, setMake] = useState("All");
  const [priceRange, setPriceRange] = useState("all");
  const [mileage, setMileage] = useState("all");
  const [sort, setSort] = useState("newest");

  const makes = ["All", ...Array.from(new Set(FEATURED_VEHICLES.map((vehicle) => vehicle.make)))];

  const filtered = useMemo(() => {
    return FEATURED_VEHICLES.filter((vehicle) => {
      const matchMake = make === "All" || vehicle.make === make;
      const matchPrice =
        priceRange === "all" ||
        (priceRange === "under-300" && vehicle.price < 300000) ||
        (priceRange === "300-500" && vehicle.price >= 300000 && vehicle.price <= 500000) ||
        (priceRange === "500-plus" && vehicle.price > 500000);
      const matchMileage =
        mileage === "all" ||
        (mileage === "under-1000" && vehicle.miles < 1000) ||
        (mileage === "1000-2500" && vehicle.miles >= 1000 && vehicle.miles <= 2500) ||
        (mileage === "2500-plus" && vehicle.miles > 2500);
      return matchMake && matchPrice && matchMileage;
    });
  }, [make, mileage, priceRange]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return b.id - a.id;
    });
  }, [filtered, sort]);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Private inventory</p>
          <h1 className={styles.title}>A quieter, sharper catalog for exceptional machines.</h1>
        </div>
        <div className={styles.heroMeta}>
          <p className={styles.subtitle}>
            Every listing is presented with restraint, context, and a purchase path designed for serious buyers.
          </p>
          <div className={styles.metaCards}>
            <div className={styles.metaCard}>
              <span className={styles.metaValue}>{sorted.length}</span>
              <span className={styles.metaLabel}>Verified vehicles</span>
            </div>
            <div className={styles.metaCard}>
              <span className={styles.metaValue}>1:1</span>
              <span className={styles.metaLabel}>Concierge support</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.layout}>
        <aside className={styles.filters}>
          <div className={styles.panelHeading}>
            <p className={styles.panelEyebrow}>Refine the room</p>
            <h2 className={styles.panelTitle}>Filter the collection</h2>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Make</span>
            <select className={styles.select} value={make} onChange={(event) => setMake(event.target.value)}>
              {makes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Price band</span>
            <select className={styles.select} value={priceRange} onChange={(event) => setPriceRange(event.target.value)}>
              {priceRanges.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Mileage</span>
            <select className={styles.select} value={mileage} onChange={(event) => setMileage(event.target.value)}>
              {mileageRanges.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Sort</span>
            <select className={styles.select} value={sort} onChange={(event) => setSort(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.noteCard}>
            <p className={styles.noteTitle}>Collector-grade pace</p>
            <p className={styles.noteCopy}>
              The catalog is intentionally restrained. Fewer listings, more context, and a cleaner path to a real
              conversation.
            </p>
          </div>
        </aside>

        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>Showing {sorted.length} vehicles</p>
            <p className={styles.resultsNote}>Verified sellers, editorial framing, direct inquiry flow.</p>
          </div>

          <div className={styles.grid}>
            {sorted.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
