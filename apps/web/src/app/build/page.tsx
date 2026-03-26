"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useBuild } from "@/contexts/BuildContext";
import { getVehicles, getVehicleOptions, getInventoryItem } from "@/lib/api";
import { formatUsd } from "@/lib/formatCurrency";
import type { Vehicle } from "@/lib/api";
import styles from "./build.module.css";

const STEPS = ["Car", "Paint", "Wheels", "Extras", "Review"];

function BuildPageInner() {
  const searchParams = useSearchParams();
  const inventoryId = searchParams.get("inventoryId");
  const {
    vehicle,
    inventoryId: storeInventoryId,
    setVehicle,
    setInventoryId,
    setOptions,
    options,
    selectedOptions,
    setSelectedOption,
    totalPrice,
  } = useBuild();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (inventoryId && inventoryId !== storeInventoryId) {
      setInventoryId(inventoryId);
      getInventoryItem(inventoryId)
        .then((item) => {
          if (item.vehicle) {
            setVehicle({
              id: item.vehicle.id,
              make: item.vehicle.make,
              model: item.vehicle.model,
              trimLevel: item.vehicle.trimLevel,
              year: item.vehicle.year,
              basePrice: item.listPrice,
              bodyType: item.vehicle.bodyType ?? null,
              imageUrls: Array.isArray(item.vehicle.imageUrls) ? item.vehicle.imageUrls : null,
              isActive: true,
            });
            return getVehicleOptions(item.vehicle.id);
          }
        })
        .then((opts) => {
          if (opts) setOptions(opts);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
      return;
    }
    getVehicles()
      .then(setVehicles)
      .finally(() => setLoading(false));
  }, [inventoryId, storeInventoryId, setInventoryId, setVehicle, setOptions]);

  useEffect(() => {
    if (vehicle && !inventoryId) {
      getVehicleOptions(vehicle.id).then(setOptions);
    }
  }, [vehicle?.id, inventoryId, setOptions]);

  const optionsByCategory = options.reduce<Record<string, typeof options>>((acc, o) => {
    const cat = o.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(o);
    return acc;
  }, {});

  const handleSelectVehicle = (v: Vehicle) => {
    setVehicle(v);
    setInventoryId(null);
    setStep(1);
  };

  if (loading && !vehicle) {
    return (
      <main id="main-content" className={styles.main}>
        <p className={styles.loading}>Loading…</p>
      </main>
    );
  }

  return (
    <main id="main-content" className={styles.main}>
      <div className={styles.progress}>
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`${styles.progressDot} ${i === step ? styles.active : ""} ${i < step ? styles.done : ""}`}
            onClick={() => setStep(i)}
            aria-label={`Step ${i + 1}: ${label}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <h1 className={styles.title}>Build your ride</h1>

      {step === 0 && (
        <section className={styles.section}>
          <p className={styles.subtitle}>Choose your base vehicle</p>
          <div className={styles.vehicleGrid}>
            {vehicles.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`${styles.vehicleCard} ${vehicle?.id === v.id ? styles.selected : ""}`}
                onClick={() => handleSelectVehicle(v)}
              >
                <span className={styles.vehicleName}>{v.make} {v.model}</span>
                <span className={styles.vehicleMeta}>{v.year} · {v.trimLevel}</span>
                <span className={styles.vehiclePrice}>{formatUsd(v.basePrice)}</span>
              </button>
            ))}
          </div>
          {vehicle && (
            <div className={styles.actions}>
              <button type="button" className={styles.cta} onClick={() => setStep(1)}>
                Next: Paint
              </button>
            </div>
          )}
        </section>
      )}

      {step === 1 && vehicle && (
        <section className={styles.section}>
          <p className={styles.subtitle}>Paint & exterior</p>
          <div className={styles.optionGrid}>
            {(optionsByCategory.PAINT || []).map((o) => (
              <button
                key={o.id}
                type="button"
                className={`${styles.optionCard} ${selectedOptions.PAINT === o.id ? styles.selected : ""}`}
                onClick={() => setSelectedOption("PAINT", o.id)}
              >
                <span className={styles.optionName}>{o.name}</span>
                <span className={styles.optionPrice}>{o.priceDelta > 0 ? `+${formatUsd(o.priceDelta)}` : "Included"}</span>
              </button>
            ))}
          </div>
          {(optionsByCategory.PAINT || []).length === 0 && <p className={styles.noOptions}>No paint options — proceed to next step.</p>}
          <div className={styles.actions}>
            <button type="button" className={styles.ctaSecondary} onClick={() => setStep(0)}>Back</button>
            <button type="button" className={styles.cta} onClick={() => setStep(2)}>Next: Tyres</button>
          </div>
        </section>
      )}

      {step === 2 && vehicle && (
        <section className={styles.section}>
          <p className={styles.subtitle}>Tyres & wheels</p>
          <div className={styles.optionGrid}>
            {(optionsByCategory.TYRES || []).map((o) => (
              <button
                key={o.id}
                type="button"
                className={`${styles.optionCard} ${selectedOptions.TYRES === o.id ? styles.selected : ""}`}
                onClick={() => setSelectedOption("TYRES", o.id)}
              >
                <span className={styles.optionName}>{o.name}</span>
                <span className={styles.optionPrice}>{o.priceDelta > 0 ? `+${formatUsd(o.priceDelta)}` : "Included"}</span>
              </button>
            ))}
          </div>
          {(optionsByCategory.TYRES || []).length === 0 && <p className={styles.noOptions}>No tyre options.</p>}
          <div className={styles.actions}>
            <button type="button" className={styles.ctaSecondary} onClick={() => setStep(1)}>Back</button>
            <button type="button" className={styles.cta} onClick={() => setStep(3)}>Next: Accessories</button>
          </div>
        </section>
      )}

      {step === 3 && vehicle && (
        <section className={styles.section}>
          <p className={styles.subtitle}>Accessories & styling</p>
          <div className={styles.optionGrid}>
            {[...(optionsByCategory.ACCESSORIES || []), ...(optionsByCategory.STYLING || [])].map((o) => (
              <button
                key={o.id}
                type="button"
                className={`${styles.optionCard} ${selectedOptions[o.category] === o.id ? styles.selected : ""}`}
                onClick={() => setSelectedOption(o.category, o.id)}
              >
                <span className={styles.optionName}>{o.name}</span>
                <span className={styles.optionPrice}>{o.priceDelta > 0 ? `+${formatUsd(o.priceDelta)}` : "Included"}</span>
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.ctaSecondary} onClick={() => setStep(2)}>Back</button>
            <button type="button" className={styles.cta} onClick={() => setStep(4)}>Next: Summary</button>
          </div>
        </section>
      )}

      {step === 4 && vehicle && (
        <section className={styles.section}>
          <p className={styles.subtitle}>Summary</p>
          <div className={styles.summary}>
            <p className={styles.summaryLine}><strong>{vehicle.make} {vehicle.model}</strong> {vehicle.year} · {vehicle.trimLevel}</p>
            {options.filter((o) => selectedOptions[o.category] === o.id).map((o) => (
              <p key={o.id} className={styles.summaryLine}>+ {o.name} (+{formatUsd(o.priceDelta)})</p>
            ))}
            <p className={styles.summaryTotal}>Total: {formatUsd(totalPrice)}</p>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.ctaSecondary} onClick={() => setStep(3)}>Back</button>
            <Link href={`/checkout?build=1`} className={styles.cta}>Continue to checkout</Link>
          </div>
        </section>
      )}
    </main>
  );
}

export default function BuildPage() {
  return (
    <Suspense
      fallback={
        <main id="main-content" className={styles.main}>
          <p className={styles.loading}>Loading…</p>
        </main>
      }
    >
      <BuildPageInner />
    </Suspense>
  );
}
