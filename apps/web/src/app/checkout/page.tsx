"use client";

import { useState, useEffect } from "react";
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
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./checkout.module.css";

export default function CheckoutPage() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const buildMode = searchParams.get("build") === "1";
  const inventoryId = searchParams.get("inventoryId");
  const tradeInId = searchParams.get("tradeInId");

  const { vehicle, inventoryId: buildInventoryId, selectedOptions, options, totalPrice } = useBuild();

  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [shippingOrigin, setShippingOrigin] = useState("");
  const [shippingDest, setShippingDest] = useState("");
  const [shippingType, setShippingType] = useState<"OPEN" | "ENCLOSED">("ENCLOSED");
  const [shippingQuote, setShippingQuote] = useState<{ amount: number } | null>(null);

  const [financePrice, setFinancePrice] = useState(0);
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
        .then((a) => setTradeInSnapshot({ id: a.id, estimatedValue: a.estimatedValue, vehicleInfo: a.vehicleInfo }))
        .catch(() => {});
    }
  }, [tradeInId]);

  useEffect(() => {
    setFinancePrice(effectiveTotal);
  }, [effectiveTotal]);

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
      window.location.href = "/login?redirect=" + encodeURIComponent("/checkout" + (buildMode ? "?build=1" : effectiveInventoryId ? "?inventoryId=" + effectiveInventoryId : ""));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        type: buildMode ? "CUSTOM_BUILD" : "INVENTORY",
        inventoryId: buildMode ? undefined : effectiveInventoryId ?? undefined,
        vehicleId: buildMode ? vehicle?.id : undefined,
        configSnapshot: buildMode
          ? {
              vehicle: vehicle ? { id: vehicle.id, make: vehicle.make, model: vehicle.model, year: vehicle.year, trimLevel: vehicle.trimLevel } : null,
              selectedOptions: options.filter((o) => selectedOptions[o.category] === o.id).map((o) => ({ id: o.id, category: o.category, name: o.name, priceDelta: o.priceDelta })),
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

  if (loading && !buildMode && effectiveInventoryId) {
    return (
      <>
        <Header />
        <main className={styles.main}><p className={styles.loading}>Loading…</p></main>
      </>
    );
  }

  if (orderId) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.confirmation}>
            <h1 className={styles.confirmTitle}>Order placed</h1>
            <p className={styles.confirmId}>Order ID: {orderId}</p>
            <p className={styles.confirmNote}>We&apos;ll contact you to complete the deposit and delivery.</p>
            <Link href="/portal" className={styles.cta}>View in portal</Link>
            <Link href="/" className={styles.ctaSecondary}>Back to home</Link>
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
      <main className={styles.main}>
        <h1 className={styles.title}>Checkout</h1>

        {noVehicle && !effectiveInventoryId && (
          <p className={styles.empty}>Add a vehicle from <Link href="/inventory">inventory</Link> or <Link href="/build">build your ride</Link> first.</p>
        )}

        {canSubmit && (
          <>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Order summary</h2>
              <p className={styles.summaryLine}>
                {displayVehicle ? `${displayVehicle.make} ${displayVehicle.model} ${displayVehicle.year}` : "Vehicle"} — £{effectiveTotal.toLocaleString()}
              </p>
              {buildMode && options.filter((o) => selectedOptions[o.category] === o.id).map((o) => (
                <p key={o.id} className={styles.summaryLine}>+ {o.name} (+£{o.priceDelta})</p>
              ))}
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Financing</h2>
              <div className={styles.formRow}>
                <label>Term (months)</label>
                <input type="number" min={12} max={96} value={termMonths} onChange={(e) => setTermMonths(Number(e.target.value))} className={styles.input} />
              </div>
              <div className={styles.formRow}>
                <label>APR (%)</label>
                <input type="number" step={0.1} min={0} value={apr} onChange={(e) => setApr(Number(e.target.value))} className={styles.input} />
              </div>
              {financeResult && (
                <p className={styles.financeResult}>Estimated payment: £{financeResult.monthlyPayment.toFixed(2)}/mo · Total £{financeResult.totalAmount.toLocaleString()}</p>
              )}
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Shipping</h2>
              <div className={styles.formRow}>
                <label>Origin</label>
                <input type="text" placeholder="Address or city" value={shippingOrigin} onChange={(e) => setShippingOrigin(e.target.value)} className={styles.input} />
              </div>
              <div className={styles.formRow}>
                <label>Destination</label>
                <input type="text" placeholder="Address or city" value={shippingDest} onChange={(e) => setShippingDest(e.target.value)} className={styles.input} />
              </div>
              <div className={styles.formRow}>
                <label>Transport</label>
                <select value={shippingType} onChange={(e) => setShippingType(e.target.value as "OPEN" | "ENCLOSED")} className={styles.select}>
                  <option value="OPEN">Open</option>
                  <option value="ENCLOSED">Enclosed</option>
                </select>
              </div>
              <button type="button" onClick={handleShippingQuote} className={styles.ctaSecondary}>Get quote</button>
              {shippingQuote && <p className={styles.shippingResult}>Shipping: £{shippingQuote.amount.toFixed(2)}</p>}
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Trade-in</h2>
              <Link href="/appraisal" className={styles.link}>Get your trade-in value</Link>
              {tradeInSnapshot && <p className={styles.tradeInNote}>Trade-in value applied: £{(tradeInSnapshot.estimatedValue as number)?.toLocaleString()}</p>}
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Deal analysis & VIP</h2>
              <p className={styles.upsellText}>Check My Deal — get expert recommendations on your deal. £99/mo or £750/yr.</p>
              <Link href="/portal/subscriptions" className={styles.link}>Manage subscriptions in Portal</Link>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Deposit</h2>
              <input type="number" min={0} placeholder="Amount (optional)" value={deposit} onChange={(e) => setDeposit(e.target.value)} className={styles.input} />
            </section>

            {!token && (
              <p className={styles.loginHint}>You’ll be asked to sign in when you place your order.</p>
            )}
            {error && <p className={styles.error}>{error}</p>}
            <button type="button" onClick={handleSubmit} disabled={submitting} className={styles.cta}>
              {submitting ? "Placing order…" : "Place order"}
            </button>
          </>
        )}
      </main>
    </>
  );
}
