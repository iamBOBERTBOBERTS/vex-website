"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createAppraisal } from "@/lib/api";
import { trackEvent } from "@/lib/analytics/posthog";
import { MotionReveal } from "@/components/site/MotionReveal";

const CONDITIONS = ["excellent", "good", "fair", "poor"] as const;
const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";

const methodology = [
  {
    title: "Market position",
    copy: "Comparable listings, recent movement, mileage bands, configuration quality, and seller posture are reviewed together.",
  },
  {
    title: "Condition signal",
    copy: "Paint, service history, tire/brake life, ownership notes, modifications, and accident disclosures influence confidence.",
  },
  {
    title: "Expert review",
    copy: "A human review layer turns raw intake into a practical next step: retail, consignment, trade, or private acquisition.",
  },
];

const timeline = [
  "Submit vehicle identity, mileage, condition, and ownership notes.",
  "VEX reviews market position, condition class, rarity, and buyer demand.",
  "A concierge follow-up frames next steps, documentation, and optional acquisition path.",
];

function buildMailtoHref(subject: string, lines: Array<string | null | undefined>) {
  if (!contactEmail) return null;
  const body = lines.filter(Boolean).join("\n");
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function AppraisalPage() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [condition, setCondition] = useState<(typeof CONDITIONS)[number] | "">("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTenantId(new URLSearchParams(window.location.search).get("tenantId"));
  }, []);

  const conciergeFallbackHref = useMemo(
    () =>
      buildMailtoHref("Private appraisal request", [
        "Private appraisal details",
        `VIN: ${vin.trim() || "Not provided"}`,
        `Mileage: ${mileage.trim() || "Not provided"}`,
        `Condition: ${condition || "Not provided"}`,
        `Notes: ${notes.trim() || "Not provided"}`,
      ]),
    [condition, mileage, notes, vin]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    const parsedMileage = mileage === "" ? undefined : Number(mileage);
    if (mileage !== "" && Number.isNaN(parsedMileage)) {
      setError("Mileage must be a number.");
      return;
    }

    const vinTrim = vin.trim();
    const hasVin = vinTrim.length === 17;
    if (vinTrim.length > 0 && !hasVin) {
      setError("VIN must be exactly 17 characters.");
      return;
    }

    const hasNotes = notes.trim().length > 0;
    if (!hasVin && parsedMileage === undefined && !condition && !hasNotes) {
      setError("Enter at least mileage and condition, a full VIN, or notes.");
      return;
    }

    setLoading(true);
    trackEvent("appraisal_submission_funnel", {
      stage: "submit_attempt",
      hasVin,
      hasMileage: parsedMileage !== undefined,
      hasCondition: Boolean(condition),
      hasNotes,
    });
    try {
      const data = await createAppraisal(
        {
          ...(hasVin ? { vin: vinTrim.toUpperCase() } : {}),
          ...(parsedMileage !== undefined && !Number.isNaN(parsedMileage)
            ? { mileage: Math.max(0, Math.floor(parsedMileage)) }
            : {}),
          ...(condition ? { condition } : {}),
          ...(hasNotes ? { notes: notes.trim() } : {}),
        },
        { tenantId }
      );
      setResult({ id: data.id, message: data.message });
      trackEvent("appraisal_submission_funnel", { stage: "submit_success", appraisalId: data.id });
    } catch {
      setError("Failed to submit appraisal.");
      trackEvent("appraisal_submission_funnel", { stage: "submit_failure" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" className="shell py-14 sm:py-18">
      <MotionReveal className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="glass-panel rounded-[2rem] p-7 sm:p-9">
          <p className="section-kicker">Private valuation intake</p>
          <h1 className="section-title">A premium appraisal flow built around confidence, not guesswork.</h1>
          <p className="section-copy max-w-xl">
            Submit the vehicle for a discreet review that considers market timing, condition quality, provenance,
            and acquisition fit. No noisy onboarding, just the details needed to start a serious valuation conversation.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {["Private submission", "Expert review", "Market-aware guidance"].map((signal) => (
              <div key={signal} className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-[#fff8eb]">{signal}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="cinema-panel rounded-[2rem] p-7 sm:p-9">
          {result ? (
            <div>
              <p className="section-kicker">Submitted</p>
              <p className="mt-4 text-3xl text-[#fff8eb]">{result.message}</p>
              <p className="mt-3 text-sm text-[#bcae97]">Reference: {result.id}</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href={`/checkout?tradeInId=${result.id}`} className="gold-button">
                  Continue to checkout
                </Link>
                <Link href="/checkout" className="ghost-button">
                  Review acquisition path
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm text-[#ddd4c6]">VIN (optional, 17 chars)</span>
                <input
                  type="text"
                  value={vin}
                  onChange={(event) => setVin(event.target.value.toUpperCase())}
                  className="field-base"
                  placeholder="e.g. 1HGBH41JXMN109186"
                  maxLength={17}
                  autoComplete="off"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-[#ddd4c6]">Mileage</span>
                <input
                  type="number"
                  min={0}
                  value={mileage}
                  onChange={(event) => setMileage(event.target.value)}
                  className="field-base"
                  placeholder="e.g. 15000"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-[#ddd4c6]">Condition</span>
                <select
                  value={condition}
                  onChange={(event) => setCondition(event.target.value as (typeof CONDITIONS)[number] | "")}
                  className="field-base"
                >
                  <option value="">Select condition</option>
                  {CONDITIONS.map((item) => (
                    <option key={item} value={item}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-[#ddd4c6]">Notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="field-base min-h-32"
                  rows={4}
                  maxLength={2000}
                  placeholder="Anything the dealer should know"
                />
              </label>

              {error ? <p className="rounded-[1.2rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="gold-button w-full"
                data-analytics-event="appraisal_submission_funnel"
                data-analytics-surface="appraisal_form"
                data-analytics-stage="submit_click"
              >
                {loading ? "Submitting..." : "Request Private Valuation"}
              </button>

              <div className="mt-6 rounded-[1.35rem] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-[#d8d0c2]">
                <p className="section-kicker">Manual fallback</p>
                <p className="mt-3">
                  If the live intake line is unavailable, the concierge team can still review the vehicle directly.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  {conciergeFallbackHref ? (
                    <a href={conciergeFallbackHref} className="ghost-button">
                      Email The Intake
                    </a>
                  ) : (
                    <Link href="/contact" className="ghost-button">
                      Continue To Concierge
                    </Link>
                  )}
                  <Link href="/contact" className="gold-button">
                    Open Private Contact
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </MotionReveal>

      <MotionReveal className="mt-12 grid gap-6 lg:grid-cols-3">
        {methodology.map((item) => (
          <div key={item.title} className="glass-panel rounded-[1.75rem] p-6">
            <p className="section-kicker">{item.title}</p>
            <p className="mt-5 text-sm leading-7 text-[#d8d0c2]">{item.copy}</p>
          </div>
        ))}
      </MotionReveal>

      <MotionReveal className="mt-12 cinema-panel rounded-[2rem] p-7 sm:p-9">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-kicker">Review timeline</p>
            <h2 className="section-title">A calmer path from raw details to market confidence.</h2>
            <p className="section-copy">
              The appraisal layer is designed to protect privacy while giving owners enough clarity to decide whether to sell,
              consign, trade, or pursue a private acquisition strategy.
            </p>
          </div>
          <div className="grid gap-4">
            {timeline.map((step, index) => (
              <div key={step} className="rounded-[1.35rem] border border-white/10 bg-black/24 p-5">
                <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#f1d38a]/70">Step 0{index + 1}</p>
                <p className="mt-3 text-sm leading-7 text-[#d8d0c2]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </MotionReveal>

      <MotionReveal className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="glass-panel rounded-[2rem] p-7 sm:p-9">
          <p className="section-kicker">Privacy standard</p>
          <h2 className="mt-4 text-3xl text-[#fff8eb]">Your vehicle data should not feel like a lead form commodity.</h2>
          <p className="mt-5 text-sm leading-7 text-[#d8d0c2]">
            VEX collects only the details needed to begin a legitimate review. Sensitive context stays tied to the appraisal path,
            and concierge follow-up should happen with purpose, not generic sales pressure.
          </p>
        </div>
        <div className="glass-panel rounded-[2rem] p-7 sm:p-9">
          <p className="section-kicker">Condition guidance</p>
          <div className="mt-5 grid gap-3 text-sm leading-7 text-[#d8d0c2]">
            <p>Excellent: documented care, strong cosmetics, clean ownership story.</p>
            <p>Good: usable quality with normal wear and clear maintenance expectations.</p>
            <p>Fair/Poor: disclose needs early so valuation confidence stays realistic.</p>
            <p>
              Direct line: {contactPhone || "Phone on request"}{contactEmail ? ` • ${contactEmail}` : ""}
            </p>
          </div>
        </div>
      </MotionReveal>
    </main>
  );
}
