"use client";

import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { useBuild } from "@/contexts/BuildContext";
import { getVehicles, getVehicleOptions, getInventoryItem } from "@/lib/api";
import { formatUsd } from "@/lib/formatCurrency";
import type { Vehicle, ConfigOption } from "@/lib/api";
import {
  FINISH_SWATCHES,
  paintOptionNameToFinishId,
  type EditionId,
  type PowertrainId,
} from "@/components/configurator/vehicleFinish";
import type { CameraPreset } from "@/components/configurator/VehicleScene";
import { ConfiguratorCommissionSheet } from "@/components/configurator/ConfiguratorCommissionSheet";
import { ConfigOptionCard } from "@/components/configurator/ConfigOptionCard";
import { ApexStudioEngine } from "@/components/configurator/studio";
import styles from "./build.module.css";

const ConfiguratorVehicleCanvas = dynamic(
  () =>
    import("@/components/configurator/ConfiguratorVehicleCanvas").then((mod) => mod.ConfiguratorVehicleCanvas),
  { ssr: false, loading: () => <div className={styles.previewLoader}>Preparing studio…</div> }
);

const STEPS = ["Car", "Paint", "Wheels", "Extras", "Review"] as const;
const COMMISSION_STEPS = STEPS.map((label, index) => ({ label, index }));

const EDITIONS: readonly EditionId[] = ["Launch", "Heritage", "Track"];
const POWERTRAINS: readonly PowertrainId[] = ["V12", "Twin-turbo V8", "Hybrid"];

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
    finishId,
    edition,
    powertrain,
    setFinishId,
    setEdition,
    setPowertrain,
  } = useBuild();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);

  const handlePaintSelect = useCallback(
    (o: ConfigOption) => {
      setSelectedOption("PAINT", o.id);
      setFinishId(paintOptionNameToFinishId(o.name));
    },
    [setSelectedOption, setFinishId]
  );

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
    if (!inventoryId) {
      getVehicles()
        .then(setVehicles)
        .finally(() => setLoading(false));
      return;
    }
    setLoading(false);
  }, [inventoryId, storeInventoryId, setInventoryId, setVehicle, setOptions]);

  useEffect(() => {
    if (vehicle && !inventoryId) {
      getVehicleOptions(vehicle.id).then(setOptions);
    }
  }, [vehicle?.id, inventoryId, setOptions]);

  /** Default paint selection + showroom finish when options load */
  useEffect(() => {
    if (!vehicle || !options.length) return;
    const paints = options.filter((o) => o.category === "PAINT");
    if (!paints.length) return;
    if (selectedOptions.PAINT) return;
    const preferred = paints.find((p) => p.name.toLowerCase().includes("rosso")) ?? paints[0];
    setSelectedOption("PAINT", preferred.id);
    setFinishId(paintOptionNameToFinishId(preferred.name));
  }, [vehicle, options, selectedOptions.PAINT, setSelectedOption, setFinishId]);

  const optionsByCategory = options.reduce<Record<string, typeof options>>((acc, o) => {
    const cat = o.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(o);
    return acc;
  }, {});

  const selectedLines = useMemo(
    () =>
      options
        .filter((o) => selectedOptions[o.category] === o.id)
        .map((o) => ({ label: o.name, delta: o.priceDelta })),
    [options, selectedOptions]
  );

  const finishLabel = FINISH_SWATCHES.find((f) => f.id === finishId)?.label ?? finishId;

  const checkoutQuery = inventoryId
    ? `inventoryId=${encodeURIComponent(inventoryId)}`
    : "build=1";

  const handleSelectVehicle = (v: Vehicle) => {
    setVehicle(v);
    setInventoryId(null);
    setStep(1);
  };

  if (loading && !vehicle) {
    return (
      <>
        <Header />
        <main id="main-content" className={styles.main} data-apex-studio-page="1">
          <p className={styles.loading}>Loading…</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main id="main-content" className={styles.main} data-apex-studio-page="1">
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

        <h1 className={styles.title}>
          Apex Studio <span className={styles.titleAccent}>— build your ride</span>
        </h1>

        <div className={vehicle ? `${styles.layout} ${styles.layoutWithVehicle}` : styles.layout}>
          {vehicle && (
            <aside className={styles.preview} aria-label="Live 3D preview">
              <ApexStudioEngine showBranding={false}>
                <div className={styles.previewFrame}>
                  <ConfiguratorVehicleCanvas
                    finishId={finishId}
                    edition={edition}
                    powertrain={powertrain}
                    compact={false}
                    embed
                    premium
                    minimal
                    cameraPresetOverride={cameraPreset}
                    autoRotateOverride={autoRotate}
                    onCameraPresetChange={setCameraPreset}
                    onAutoRotateChange={setAutoRotate}
                  />
                </div>
                <div className={styles.cameraTour} role="group" aria-label="Studio camera chapters">
                <span className={styles.cameraTourLabel}>Camera chapters</span>
                <div className={styles.cameraTourRow}>
                  <button type="button" className={styles.cameraTourBtn} onClick={() => setCameraPreset("threeQuarter")}>
                    Hero
                  </button>
                  <button type="button" className={styles.cameraTourBtn} onClick={() => setCameraPreset("side")}>
                    Profile
                  </button>
                  <button type="button" className={styles.cameraTourBtn} onClick={() => setCameraPreset("front")}>
                    Front
                  </button>
                  <button type="button" className={styles.cameraTourBtn} onClick={() => setCameraPreset("top")}>
                    Detail
                  </button>
                  <button type="button" className={styles.cameraTourBtn} onClick={() => setAutoRotate((v) => !v)}>
                    {autoRotate ? "Stop orbit" : "Orbit"}
                  </button>
                </div>
              </div>
              <div className={styles.specChips}>
                <div className={styles.specChip}>
                  <span className={styles.specChipLabel}>Edition</span>
                  <span className={styles.specChipValue}>{edition}</span>
                </div>
                <div className={styles.specChip}>
                  <span className={styles.specChipLabel}>Power</span>
                  <span className={styles.specChipValue}>{powertrain}</span>
                </div>
                <div className={styles.specChip}>
                  <span className={styles.specChipLabel}>Finish</span>
                  <span className={styles.specChipValue}>{finishLabel}</span>
                </div>
              </div>
              <fieldset className={styles.inlineFieldset}>
                <legend className={styles.inlineLegend}>Edition & powertrain</legend>
                <div className={styles.inlineRow}>
                  <span className={styles.inlineLabel}>Edition</span>
                  <div className={styles.inlineBtns}>
                    {EDITIONS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        className={edition === e ? styles.inlineBtnActive : styles.inlineBtn}
                        onClick={() => setEdition(e)}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.inlineRow}>
                  <span className={styles.inlineLabel}>Powertrain</span>
                  <div className={styles.inlineBtns}>
                    {POWERTRAINS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={powertrain === p ? styles.inlineBtnActive : styles.inlineBtn}
                        onClick={() => setPowertrain(p)}
                      >
                        {p === "Twin-turbo V8" ? "TT V8" : p}
                      </button>
                    ))}
                  </div>
                </div>
              </fieldset>
              </ApexStudioEngine>
            </aside>
          )}

          <div className={styles.content}>
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
                      <span className={styles.vehicleName}>
                        {v.make} {v.model}
                      </span>
                      <span className={styles.vehicleMeta}>
                        {v.year} · {v.trimLevel}
                      </span>
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
                <p className={styles.hint}>
                  Pick a finish — the studio updates in real time. Swatches map to showroom paint (Rosso / Nero / Oro).
                </p>
                <div className={styles.optionGrid}>
                  {(optionsByCategory.PAINT || []).map((o) => (
                    <ConfigOptionCard
                      key={o.id}
                      name={o.name}
                      priceLabel={o.priceDelta > 0 ? `+${formatUsd(o.priceDelta)}` : "Included"}
                      selected={selectedOptions.PAINT === o.id}
                      onSelect={() => handlePaintSelect(o)}
                    />
                  ))}
                </div>
                {(optionsByCategory.PAINT || []).length === 0 && (
                  <p className={styles.noOptions}>
                    No paint options in catalog — use the studio swatches on the home page, or re-seed the API with PAINT
                    options.
                  </p>
                )}
                <div className={styles.actions}>
                  <button type="button" className={styles.ctaSecondary} onClick={() => setStep(0)}>
                    Back
                  </button>
                  <button type="button" className={styles.cta} onClick={() => setStep(2)}>
                    Next: Wheels
                  </button>
                </div>
              </section>
            )}

            {step === 2 && vehicle && (
              <section className={styles.section}>
                <p className={styles.subtitle}>Tires & wheels</p>
                <div className={styles.optionGrid}>
                  {(optionsByCategory.TIRES || []).map((o) => (
                    <ConfigOptionCard
                      key={o.id}
                      name={o.name}
                      priceLabel={o.priceDelta > 0 ? `+${formatUsd(o.priceDelta)}` : "Included"}
                      selected={selectedOptions.TIRES === o.id}
                      onSelect={() => setSelectedOption("TIRES", o.id)}
                    />
                  ))}
                </div>
                {(optionsByCategory.TIRES || []).length === 0 && (
                  <p className={styles.noOptions}>No tire packages listed — continue to accessories.</p>
                )}
                <div className={styles.actions}>
                  <button type="button" className={styles.ctaSecondary} onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button type="button" className={styles.cta} onClick={() => setStep(3)}>
                    Next: Accessories
                  </button>
                </div>
              </section>
            )}

            {step === 3 && vehicle && (
              <section className={styles.section}>
                <p className={styles.subtitle}>Accessories & styling</p>
                <div className={styles.optionGrid}>
                  {[...(optionsByCategory.ACCESSORIES || []), ...(optionsByCategory.STYLING || [])].map((o) => (
                    <ConfigOptionCard
                      key={o.id}
                      name={o.name}
                      priceLabel={o.priceDelta > 0 ? `+${formatUsd(o.priceDelta)}` : "Included"}
                      selected={selectedOptions[o.category] === o.id}
                      onSelect={() => setSelectedOption(o.category, o.id)}
                    />
                  ))}
                </div>
                {[...(optionsByCategory.ACCESSORIES || []), ...(optionsByCategory.STYLING || [])].length === 0 && (
                  <p className={styles.noOptions}>No add-ons listed — continue to review.</p>
                )}
                <div className={styles.actions}>
                  <button type="button" className={styles.ctaSecondary} onClick={() => setStep(2)}>
                    Back
                  </button>
                  <button type="button" className={styles.cta} onClick={() => setStep(4)}>
                    Next: Summary
                  </button>
                </div>
              </section>
            )}

            {step === 4 && vehicle && (
              <section className={styles.section}>
                <p className={styles.subtitle}>Summary</p>
                <div className={styles.summary}>
                  <p className={styles.summaryLine}>
                    <strong>
                      {vehicle.make} {vehicle.model}
                    </strong>{" "}
                    {vehicle.year} · {vehicle.trimLevel}
                  </p>
                  <p className={styles.summaryLine}>
                    Spec: {edition} · {powertrain} · {finishLabel}
                  </p>
                  {options
                    .filter((o) => selectedOptions[o.category] === o.id)
                    .map((o) => (
                      <p key={o.id} className={styles.summaryLine}>
                        + {o.name} ({o.priceDelta > 0 ? `+${formatUsd(o.priceDelta)}` : "included"})
                      </p>
                    ))}
                  <p className={styles.summaryTotal}>Total: {formatUsd(totalPrice)}</p>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.ctaSecondary} onClick={() => setStep(3)}>
                    Back
                  </button>
                  <Link href={`/checkout?${checkoutQuery}`} className={styles.cta}>
                    Continue to checkout
                  </Link>
                </div>
              </section>
            )}
          </div>

          {vehicle && (
            <ConfiguratorCommissionSheet
              className={styles.commissionSheet}
              vehicle={vehicle}
              edition={edition}
              powertrain={powertrain}
              finishLabel={finishLabel}
              totalPrice={totalPrice}
              selectedLines={selectedLines}
              stepIndex={step}
              steps={COMMISSION_STEPS}
              checkoutQuery={checkoutQuery}
            />
          )}
        </div>
      </main>
    </>
  );
}

export default function BuildPage() {
  return (
    <Suspense
      fallback={
        <main id="main-content" className={styles.main} data-apex-studio-page="1">
          <p className={styles.loading}>Loading…</p>
        </main>
      }
    >
      <BuildPageInner />
    </Suspense>
  );
}
