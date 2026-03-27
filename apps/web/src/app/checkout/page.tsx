"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { useBuild } from "@/contexts/BuildContext";
import {
  getInventoryItem,
  getShippingQuote,
  getFinancingCalculate,
  createOrder,
  getAppraisal,
  type InventoryItem,
  type CreateOrderPayload,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatUsd } from "@/lib/formatCurrency";
import { FINISH_SWATCHES } from "@/components/configurator/vehicleFinish";
import styles from "./checkout.module.css";

function CheckoutPageInner() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const buildMode = searchParams.get("build") === "1";
  const inventoryId = searchParams.get("inventoryId");
  const tradeInId = searchParams.get("tradeInId");

  const {
    vehicle,
    inventoryId: buildInventoryId,
    selectedOptions,
    options,
    totalPrice,
    finishId,
    edition,
    powertrain,
  } = useBuild();

  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [shippingOrigin, setShippingOrigin] = useState("");
  const [shippingDest, setShippingDest] = useState("");
  const [shippingType, setShippingType] = useState<"OPEN" | "ENCLOSED">("ENCLOSED");
  const [shippingQuote, setShippingQuote] = useState<{ amount: number } | null>(null);
  const [termMonths, setTermMonths] = useState(48);
  const [apr, setApr] = useState(5.9);
  const [financeResult, setFinanceResult] = useState<{ monthlyPayment: number; totalAmount: number } | null>(null);

  const [deposit, setDeposit] = useState("");
  const [tradeInSnapshot, setTradeInSnapshot] = useState<Record<string, unknown> | null>(null);

  const effectiveInventoryId = inventoryId || buildInventoryId;
  const effectiveTotal = buildMode ? totalPrice : (inventoryItem?.listPrice ?? 0);
  const displayVehicle = buildMode ? vehicle : inventoryItem?.vehicle;

  useEffect(() => {
    if (effectiveInventoryId && !buildMode) {
      getInventoryItem(effectiveInventoryId)
        .then(setInventoryItem)
        .catch(() => setInventoryItem(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [effectiveInventoryId, buildMode]);

  useEffect(() => {
    if (tradeInId) {
      getAppraisal(tradeInId)
        .then((a) => {
          let vehicleInfo: unknown = null;
          try {
            vehicleInfo = a.notes ? JSON.parse(a.notes) : null;
          } catch {
            vehicleInfo = null;
          }
          const v = a.value ?? null;
          setTradeInSnapshot({ id: a.id, estimatedValue: v, value: v, vehicleInfo });
        })
        .catch(() => {});
    }
  }, [tradeInId]);

  useEffect(() => {
    if (effectiveTotal <= 0) return;
    getFinancingCalculate({ price: effectiveTotal, termMonths, apr })
      .then((r) => setFinanceResult({ monthlyPayment: r.monthlyPayment, totalAmount: r.totalAmount }))
      .catch(() => setFinanceResult(null));
  }, [effectiveTotal, termMonths, apr]);

  const handleShippingQuote = () => {
    if (!shippingOrigin.trim() || !shippingDest.trim()) return;
    getShippingQuote({ origin: shippingOrigin, destination: shippingDest, openEnclosed: shippingType })
      .then((r) => setShippingQuote({ amount: r.amount }))
      .catch(() => setShippingQuote(null));
  };

  const handleSubmit = async () => {
    if (!token) {
      const returnUrl = "/checkout" + (buildMode ? "?build=1" : effectiveInventoryId ? "?inventoryId=" + effectiveInventoryId : "");
      window.location.href = "/login?redirect=" + encodeURIComponent(returnUrl);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateOrderPayload = {
        type: (buildMode ? "CUSTOM_BUILD" : "INVENTORY") as CreateOrderPayload["type"],
        inventoryId: buildMode ? undefined : effectiveInventoryId ?? undefined,
        vehicleId: buildMode ? vehicle?.id : undefined,
        configSnapshot: buildMode
          ? {
              vehicle: vehicle ? { id: vehicle.id, make: vehicle.make, model: vehicle.model, year: vehicle.year, trimLevel: vehicle.trimLevel } : null,
              selectedOptions: options.filter((o) => selectedOptions[o.category] === o.id).map((o) => ({ id: o.id, category: o.category, name: o.name, priceDelta: o.priceDelta })),
              configurator: {
                finishId,
                edition,
                powertrain,
              },
            }
          : undefined,
        totalAmount: effectiveTotal + (shippingQuote?.amount ?? 0),
        depositAmount: deposit ? Number(deposit) : undefined,
        financingSnapshot: financeResult ? { termMonths, apr, monthlyPayment: financeResult.monthlyPayment, totalAmount: financeResult.totalAmount } : undefined,
        shippingSnapshot: shippingQuote ? { amount: shippingQuote.amount, origin: shippingOrigin, destination: shippingDest, openEnclosed: shippingType } : undefined,
        tradeInSnapshot: tradeInSnapshot ?? undefined,
        status: "DRAFT" as const,
      };
      const order = await createOrder(payload, token);
      setOrderId(order.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const tradeInSnap = tradeInSnapshot as { estimatedValue?: number; value?: number } | null;
  const tradeInValue =
    tradeInSnap && typeof tradeInSnap.value === "number"
      ? tradeInSnap.value
      : tradeInSnap && typeof tradeInSnap.estimatedValue === "number"
        ? tradeInSnap.estimatedValue
        : 0;

  const grandTotal = effectiveTotal + (shippingQuote?.amount ?? 0) - tradeInValue;

  if (loading && !buildMode && effectiveInventoryId) {
    return (
      <>
        <Header />
        <main id="main-content" className={styles.main}>
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Loading your deal…</p>
          </div>
        </main>
      </>
    );
  }

  if (orderId) {
    return (
      <>
        <Header />
        <main id="main-content" className={styles.main}>
          <div className={styles.confirmation}>
            <div className={styles.confirmIcon} aria-hidden>✓</div>
            <h1 className={styles.confirmTitle}>Order placed</h1>
            <p className={styles.confirmId}>Order {orderId.slice(0, 8)}…</p>
            <p className={styles.confirmNote}>
              We&apos;ll contact you within 24 hours to finalize the deposit and arrange delivery.
            </p>
            <div className={styles.confirmActions}>
              <Link href="/portal" className={styles.cta}>View in my account</Link>
              <Link href="/inventory" className={styles.ctaOutline}>Browse more cars</Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const canSubmit = (buildMode && vehicle) || (!buildMode && inventoryItem);
  const noVehicle = !displayVehicle && !vehicle && !inventoryItem;

  return (
    <>
      <Header />
      <main id="main-content" className={styles.main}>
        <h1 className={styles.title}>Checkout</h1>

        {noVehicle && (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No vehicle selected</p>
            <p className={styles.emptyDesc}>Choose a car first, then come back here to complete your deal.</p>
            <div className={styles.emptyActions}>
              <Link href="/inventory" className={styles.cta}>Browse cars</Link>
              <Link href="/build" className={styles.ctaOutline}>Build yours</Link>
            </div>
          </div>
        )}

        {canSubmit && (
          <div className={styles.grid}>
            <div className={styles.left}>
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Your car</h2>
                {displayVehicle && (
                  <div className={styles.vehicleSummary}>
                    <p className={styles.vehicleName}>
                      {displayVehicle.make} {displayVehicle.model}
                    </p>
                    <p className={styles.vehicleMeta}>
                      {displayVehicle.year}
                      {displayVehicle.trimLevel ? ` · ${displayVehicle.trimLevel}` : ""}
                    </p>
                    {buildMode && (
                      <p className={styles.vehicleMeta}>
                        {edition} · {powertrain} ·{" "}
                        {FINISH_SWATCHES.find((f) => f.id === finishId)?.label ?? finishId}
                      </p>
                    )}
                    <p className={styles.vehiclePrice}>{formatUsd(effectiveTotal)}</p>
                  </div>
                )}
                {buildMode && options.filter((o) => selectedOptions[o.category] === o.id).length > 0 && (
                  <div className={styles.optionsList}>
                    <p className={styles.optionsLabel}>Selected options</p>
                    {options.filter((o) => selectedOptions[o.category] === o.id).map((o) => (
                      <div key={o.id} className={styles.optionRow}>
                        <span>{o.name}</span>
                        <span>+{formatUsd(Number(o.priceDelta))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Financing</h2>
                <div className={styles.formRow}>
                  <label htmlFor="checkout-term">Term (months)</label>
                  <input id="checkout-term" type="number" min={12} max={96} value={termMonths} onChange={(e) => setTermMonths(Number(e.target.value))} className={styles.input} />
                </div>
                <div className={styles.formRow}>
                  <label htmlFor="checkout-apr">APR (%)</label>
                  <input id="checkout-apr" type="number" step={0.1} min={0} value={apr} onChange={(e) => setApr(Number(e.target.value))} className={styles.input} />
                </div>
                {financeResult && (
                  <p className={styles.resultLine}>
                    {formatUsd(financeResult.monthlyPayment, 2)}/mo for {termMonths} months
                  </p>
                )}
              </section>

              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Shipping</h2>
                <div className={styles.formRow}>
                  <label htmlFor="checkout-origin">Pickup location</label>
                  <input id="checkout-origin" type="text" placeholder="City or address" value={shippingOrigin} onChange={(e) => setShippingOrigin(e.target.value)} className={styles.input} />
                </div>
                <div className={styles.formRow}>
                  <label htmlFor="checkout-dest">Delivery address</label>
                  <input id="checkout-dest" type="text" placeholder="City or address" value={shippingDest} onChange={(e) => setShippingDest(e.target.value)} className={styles.input} />
                </div>
                <div className={styles.formRow}>
                  <label htmlFor="checkout-transport">Transport type</label>
                  <select id="checkout-transport" value={shippingType} onChange={(e) => setShippingType(e.target.value as "OPEN" | "ENCLOSED")} className={styles.select}>
                    <option value="ENCLOSED">Enclosed (recommended)</option>
                    <option value="OPEN">Open</option>
                  </select>
                </div>
                <button type="button" onClick={handleShippingQuote} className={styles.btnSmall}>
                  Get quote
                </button>
                {shippingQuote && <p className={styles.resultLine}>Estimated: {formatUsd(shippingQuote.amount, 2)}</p>}
              </section>

              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Trade-in</h2>
                {tradeInSnapshot ? (
                  <p className={styles.resultLine}>
                    Credit applied: -{formatUsd(tradeInValue)}
                  </p>
                ) : (
                  <p className={styles.cardDesc}>
                    Have a car to trade? <Link href="/appraisal" className={styles.link}>Get an instant estimate</Link>
                  </p>
                )}
              </section>
            </div>

            <div className={styles.right}>
              <div className={styles.stickyPanel}>
                <h2 className={styles.panelTitle}>Order total</h2>

                <div className={styles.totalRows}>
                  <div className={styles.totalRow}>
                    <span>Vehicle</span>
                    <span>{formatUsd(effectiveTotal)}</span>
                  </div>
                  {shippingQuote && (
                    <div className={styles.totalRow}>
                      <span>Shipping</span>
                      <span>{formatUsd(shippingQuote.amount, 2)}</span>
                    </div>
                  )}
                  {tradeInValue > 0 && (
                    <div className={styles.totalRow}>
                      <span>Trade-in</span>
                      <span className={styles.credit}>-{formatUsd(tradeInValue)}</span>
                    </div>
                  )}
                </div>

                <div className={styles.grandTotal}>
                  <span>Total</span>
                  <span>{formatUsd(grandTotal, 2)}</span>
                </div>

                {financeResult && (
                  <p className={styles.financeNote}>
                    or {formatUsd(financeResult.monthlyPayment, 2)}/mo × {termMonths} mo
                  </p>
                )}

                <div className={styles.formRow}>
                  <label htmlFor="checkout-deposit">Deposit (optional)</label>
                  <input
                    id="checkout-deposit"
                    type="number"
                    min={0}
                    placeholder="$0"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className={styles.input}
                  />
                </div>

                {!token && (
                  <p className={styles.authHint}>You&apos;ll sign in on the next step.</p>
                )}

                {error && <p className={styles.error}>{error}</p>}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={styles.submitBtn}
                  data-magnetic="true"
                >
                  {submitting ? "Placing order…" : "Place order"}
                </button>

                <p className={styles.disclaimer}>
                  No payment is charged now. We&apos;ll reach out to finalize your deal.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <main id="main-content" className={styles.main}>
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>Loading checkout…</p>
            </div>
          </main>
        </>
      }
    >
      <CheckoutPageInner />
    </Suspense>
  );
}
