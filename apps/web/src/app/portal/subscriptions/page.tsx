"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { getSubscriptions, createSubscription, runDealAnalysis } from "@/lib/api";
import { useBuild } from "@/contexts/BuildContext";
import type { SubscriptionItem } from "@/lib/api";
import styles from "./subscriptions.module.css";

export default function PortalSubscriptionsPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { vehicle, totalPrice, selectedOptions, options } = useBuild();
  const [subs, setSubs] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/portal/subscriptions");
      return;
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!token) return;
    getSubscriptions(token)
      .then(setSubs)
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  }, [token]);

  const hasCheckMyDeal = subs.some((s) => s.plan === "CHECK_MY_DEAL" && s.status === "ACTIVE");
  const handleSubscribe = async (plan: string, interval: string) => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await createSubscription(
        { plan, billingInterval: interval, amount: plan === "CHECK_MY_DEAL" ? (interval === "yearly" ? 750 : 99) : 499 },
        token
      );
      const updated = await getSubscriptions(token);
      setSubs(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to subscribe");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setAnalysis(null);
    try {
      const financing = { termMonths: 48, apr: 5.9 };
      const total = totalPrice || 0;
      const res = await runDealAnalysis(
        { vehicle: vehicle ? { make: vehicle.make, model: vehicle.model, year: vehicle.year } : undefined, financing, totalAmount: total },
        token
      );
      setAnalysis(res.recommendations);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deal analysis failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <>
        <Header />
        <main className={styles.main}><p className={styles.loading}>Loading…</p></main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <Link href="/portal" className={styles.back}>← Portal</Link>
        <h1 className={styles.title}>Subscriptions</h1>

        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : (
          <>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Check My Deal</h2>
              <p className={styles.desc}>Get expert recommendations on your vehicle deal before you buy. We analyse financing, shipping, and add-ons.</p>
              {hasCheckMyDeal ? (
                <>
                  <p className={styles.active}>Active</p>
                  <button type="button" onClick={handleRunAnalysis} disabled={submitting} className={styles.cta}>
                    {submitting ? "Running…" : "Run deal analysis now"}
                  </button>
                  {analysis && (
                    <ul className={styles.recommendations}>
                      {analysis.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div className={styles.actions}>
                  <button type="button" onClick={() => handleSubscribe("CHECK_MY_DEAL", "monthly")} disabled={submitting} className={styles.cta}>
                    £99/month
                  </button>
                  <button type="button" onClick={() => handleSubscribe("CHECK_MY_DEAL", "yearly")} disabled={submitting} className={styles.ctaSecondary}>
                    £750/year
                  </button>
                </div>
              )}
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>VIP Concierge</h2>
              <p className={styles.desc}>Full-service deal execution: we handle vehicle selection, financing, shipping, and delivery for you.</p>
              {subs.some((s) => s.plan === "VIP_CONCIERGE" && s.status === "ACTIVE") ? (
                <p className={styles.active}>Active</p>
              ) : (
                <button type="button" onClick={() => handleSubscribe("VIP_CONCIERGE", "monthly")} disabled={submitting} className={styles.cta}>
                  Subscribe — £499/mo
                </button>
              )}
            </section>

            {subs.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Your subscriptions</h2>
                <ul className={styles.list}>
                  {subs.map((s) => (
                    <li key={s.id} className={styles.card}>
                      {s.plan} · {s.status} {s.expiresAt && `· Expires ${new Date(s.expiresAt).toLocaleDateString()}`}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {error && <p className={styles.error}>{error}</p>}
          </>
        )}
      </main>
    </>
  );
}
