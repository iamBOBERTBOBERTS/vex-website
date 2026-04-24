"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { completeOnboarding, getCurrentTenantBilling } from "@/lib/api";
import { getCrmWebBase } from "@/lib/runtimeConfig";

export function OnboardingWizard() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const webBase = getCrmWebBase();

  useEffect(() => {
    if (!token) return;
    getCurrentTenantBilling(token)
      .then((b) => {
        const onboarded = (b as { onboardedAt?: string | null }).onboardedAt;
        if (!onboarded) setOpen(true);
      })
      .catch(() => {});
  }, [token]);

  if (!open || !token) return null;

  const dismiss = () => {
    void completeOnboarding(token).finally(() => setOpen(false));
  };

  return (
    <div
      style={{
        margin: "0 1.5rem 1rem",
        padding: "1rem 1.25rem",
        background: "var(--bg-card)",
        borderRadius: "8px",
        border: "1px solid rgba(255,215,0,0.25)",
      }}
    >
      <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Welcome — finish setup</p>
      <ol style={{ marginLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
        <li>
          Connect billing:{" "}
          <a href={`${webBase}/portal/subscriptions`} target="_blank" rel="noopener noreferrer">
            Stripe / subscriptions
          </a>
        </li>
        <li>
          Add inventory: <Link href="/inventory">List your first vehicle</Link>
        </li>
        <li>
          Run a sample appraisal: <Link href="/appraisals/new">New appraisal</Link>
        </li>
      </ol>
      <button
        type="button"
        onClick={dismiss}
        style={{ marginTop: "0.75rem", padding: "0.35rem 0.75rem", cursor: "pointer", background: "var(--accent)", border: "none", borderRadius: "4px", color: "#111" }}
      >
        Mark complete
      </button>
    </div>
  );
}
