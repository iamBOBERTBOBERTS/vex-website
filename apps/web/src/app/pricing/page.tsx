"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { createStripeCheckoutSession } from "@/lib/api";
import styles from "./pricing.module.css";

type BillingInterval = "monthly" | "yearly";
type Plan = "CHECK_MY_DEAL" | "VIP_CONCIERGE";

const PLANS: Array<{
  id: Plan;
  name: string;
  desc: string;
  highlight?: string;
}> = [
  {
    id: "CHECK_MY_DEAL",
    name: "Starter",
    desc: "Inventory + CRM + appraisals (instant valuations) — get online fast with trade-in tools dealers use daily.",
  },
  {
    id: "VIP_CONCIERGE",
    name: "Pro",
    desc: "Full portal + analytics + white-label + premium appraisal workflows — including unlimited API-powered valuations.",
    highlight: "Most popular",
  },
];

export default function PricingPage() {
  const { token } = useAuth();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const yearlyNote = useMemo(() => (billingInterval === "yearly" ? "Annual billing (discount applied in Stripe)" : ""), [billingInterval]);

  const startCheckout = async (plan: Plan) => {
    setError(null);
    if (!token) {
      window.location.href = "/login?redirect=" + encodeURIComponent("/pricing");
      return;
    }
    setLoadingPlan(plan);
    try {
      const session = await createStripeCheckoutSession({ plan, billingInterval }, token);
      if (session.url) window.location.href = session.url;
      else setError("Stripe did not return a checkout URL.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start checkout");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <Header />
      <main id="main-content" className={styles.main}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Dealer SaaS</p>
          <h1 className={styles.title}>Pricing that scales with your lot</h1>
          <p className={styles.subhead}>Start in minutes. Upgrade anytime. Your brand stays front-and-center.</p>
          <p className={styles.subhead} style={{ marginTop: "0.75rem", maxWidth: "40rem", opacity: 0.92 }}>
            <strong>Apex / cinematic tier:</strong> white-label 3D hero + configurator embeds tie to MRR — contact us for a quote.
            Execution blueprint: <code>docs/plans/2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.md</code> in the repo.{" "}
            <Link href="/contact?intent=apex-tier">Request Apex pricing →</Link>
          </p>
        </div>

        <div className={styles.toggleRow} aria-label="Billing interval">
          <button
            type="button"
            className={`${styles.toggle} ${billingInterval === "monthly" ? styles.toggleActive : ""}`}
            onClick={() => setBillingInterval("monthly")}
            data-magnetic="true"
            data-sfx="button"
          >
            Monthly
          </button>
          <button
            type="button"
            className={`${styles.toggle} ${billingInterval === "yearly" ? styles.toggleActive : ""}`}
            onClick={() => setBillingInterval("yearly")}
            data-magnetic="true"
            data-sfx="button"
          >
            Annual
          </button>
          {yearlyNote && <span className={styles.note}>{yearlyNote}</span>}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.grid}>
          {PLANS.map((p) => (
            <section key={p.id} className={`${styles.card} ${p.highlight ? styles.cardHighlight : ""}`}>
              {p.highlight && <div className={styles.badge}>{p.highlight}</div>}
              <h2 className={styles.cardTitle}>{p.name}</h2>
              <p className={styles.cardDesc}>{p.desc}</p>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.cta}
                  onClick={() => startCheckout(p.id)}
                  disabled={loadingPlan === p.id}
                  data-magnetic="true"
                  data-sfx="button"
                >
                  {loadingPlan === p.id ? "Redirecting…" : "Start subscription"}
                </button>
                <Link href="/portal/subscriptions" className={styles.secondary}>
                  Manage in portal
                </Link>
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}

