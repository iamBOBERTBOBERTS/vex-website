import type { CSSProperties } from "react";
import type { RaisePackage } from "@vex/shared";

const card: CSSProperties = {
  background: "#10141f",
  borderRadius: 8,
  padding: "1rem",
};

const muted: CSSProperties = { color: "var(--text-muted, #aaa)" };

export function InvestorNarrativeBlocks(props: { variant: "deck" | "data-room" }) {
  const title = props.variant === "deck" ? "Narrative" : "Overview";
  return (
    <section style={{ marginBottom: "1.75rem" }}>
      <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>{title}</h2>
      <div style={{ display: "grid", gap: "1rem" }}>
        <div style={{ ...card, padding: "1.1rem 1.15rem" }}>
          <h3 style={{ fontSize: "0.95rem", margin: "0 0 0.4rem", opacity: 0.95 }}>Thesis</h3>
          <p style={{ margin: 0, lineHeight: 1.55, fontSize: "0.95rem" }}>
            Vex is a tenant-isolated operating system for auto dealers: CRM, inventory, customer portal, and appraisals with
            auditable workflows. Revenue grows through subscription tiers, usage-based appraisal overage, and integrations
            (DMS, valuation, F&amp;I) that stay scoped per dealer.
          </p>
        </div>
        <div style={{ ...card, padding: "1.1rem 1.15rem" }}>
          <h3 style={{ fontSize: "0.95rem", margin: "0 0 0.4rem", opacity: 0.95 }}>Product proof &amp; pilot loop</h3>
          <p style={{ margin: 0, lineHeight: 1.55, fontSize: "0.95rem" }}>
            Pilots onboard with idempotent provisioning; public quick-appraisal intake feeds the same tenant-scoped
            appraisal objects staff see in the CRM. Deal-desk closes can generate inventory orders — metrics below reflect
            live pilot-network aggregates (and, with a token, a signed financial snapshot).
          </p>
        </div>
        <div style={{ ...card, padding: "1.1rem 1.15rem", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize: "0.95rem", margin: "0 0 0.4rem", opacity: 0.95 }}>Compliance note</h3>
          <p style={{ margin: 0, lineHeight: 1.55, fontSize: "0.88rem", ...muted }}>
            Figures are operational aggregates for diligence, not GAAP statements. Multi-tenant isolation and RBAC are
            enforced on APIs; investor links are time-boxed and should not be forwarded outside your firm.
          </p>
        </div>
      </div>
    </section>
  );
}

export function InvestorTokenHint(props: { hasToken: boolean }) {
  if (props.hasToken) return null;
  return (
    <div
      style={{
        ...card,
        marginBottom: "1.25rem",
        border: "1px dashed rgba(255,255,255,0.12)",
        background: "rgba(16,20,31,0.85)",
      }}
    >
      <p style={{ margin: 0, lineHeight: 1.55, fontSize: "0.95rem" }}>
        <strong>Financial snapshot:</strong> append <code style={{ fontSize: "0.88em" }}>?token=…</code> from a generated
        investor link (CRM → capital) to load MRR, tenant counts, usage revenue, and highlights. Without a token, this page
        still shows the narrative and live pilot-network metrics when the web app is configured with{" "}
        <code style={{ fontSize: "0.88em" }}>INTERNAL_PILOT_METRICS_KEY</code> (same value as the API).
      </p>
    </div>
  );
}

export function InvestorFinancialSnapshot(props: { data: RaisePackage }) {
  const { data } = props;
  return (
    <>
      <p style={{ ...muted, marginBottom: "1rem" }}>Package generated: {new Date(data.generatedAt).toLocaleString()}</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        <div style={card}>
          <div style={{ opacity: 0.8, fontSize: "0.85rem" }}>Tenants (snapshot)</div>
          <div style={{ fontSize: "1.45rem", fontWeight: 700 }}>{data.tenantCount.toLocaleString()}</div>
        </div>
        <div style={card}>
          <div style={{ opacity: 0.8, fontSize: "0.85rem" }}>Active tenants</div>
          <div style={{ fontSize: "1.45rem", fontWeight: 700 }}>{data.activeTenantCount.toLocaleString()}</div>
        </div>
        <div style={card}>
          <div style={{ opacity: 0.8, fontSize: "0.85rem" }}>MRR (snapshot)</div>
          <div style={{ fontSize: "1.45rem", fontWeight: 700 }}>${data.mrr.toLocaleString()}</div>
        </div>
        <div style={card}>
          <div style={{ opacity: 0.8, fontSize: "0.85rem" }}>Usage revenue (USD)</div>
          <div style={{ fontSize: "1.45rem", fontWeight: 700 }}>${data.usageRevenueUsd.toLocaleString()}</div>
        </div>
        <div style={card}>
          <div style={{ opacity: 0.8, fontSize: "0.85rem" }}>LTV proxy (MRR × 12)</div>
          <div style={{ fontSize: "1.45rem", fontWeight: 700 }}>${(data.mrr * 12).toLocaleString()}</div>
        </div>
      </div>
    </>
  );
}

export function InvestorPilotMetricsGrid(props: {
  pilot: NonNullable<RaisePackage["pilotNetwork"]>;
  pilotSource: "live" | "embedded" | null;
  compact?: boolean;
}) {
  const { pilot, pilotSource, compact } = props;
  const fs = compact ? "1.25rem" : "1.4rem";
  const labelFs = compact ? "0.8rem" : "0.85rem";
  const pad = compact ? "0.85rem" : "1rem";

  return (
    <section style={{ marginTop: "0.5rem", marginBottom: "1.25rem" }}>
      <h2 style={{ fontSize: compact ? "1.05rem" : "1.15rem" }}>Pilot network (aggregated)</h2>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted, #888)" }}>
        Updated {new Date(pilot.generatedAt).toLocaleString()}
        {pilotSource === "live" && " · live endpoint"}
        {pilotSource === "embedded" && " · embedded in investor package"}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
          gap: "0.75rem",
        }}
      >
        <div style={{ ...card, padding: pad }}>
          <div style={{ opacity: 0.8, fontSize: labelFs }}>Active pilots</div>
          <div style={{ fontSize: fs, fontWeight: 700 }}>{pilot.activePilots}</div>
        </div>
        <div style={{ ...card, padding: pad }}>
          <div style={{ opacity: 0.8, fontSize: labelFs }}>Pilot appraisals</div>
          <div style={{ fontSize: fs, fontWeight: 700 }}>{pilot.totalPilotAppraisals}</div>
        </div>
        <div style={{ ...card, padding: pad }}>
          <div style={{ opacity: 0.8, fontSize: labelFs }}>First billing events</div>
          <div style={{ fontSize: fs, fontWeight: 700 }}>{pilot.firstBillingEvents}</div>
        </div>
        <div style={{ ...card, padding: pad }}>
          <div style={{ opacity: 0.8, fontSize: labelFs }}>Public intake (UTC today)</div>
          <div style={{ fontSize: fs, fontWeight: 700 }}>{pilot.publicIntakeToday ?? "—"}</div>
        </div>
        <div style={{ ...card, padding: pad }}>
          <div style={{ opacity: 0.8, fontSize: labelFs }}>Public quick-appraisal (lifetime)</div>
          <div style={{ fontSize: fs, fontWeight: 700 }}>
            {pilot.publicQuickAppraisalSubmissionsLifetime ?? "—"}
          </div>
        </div>
        <div style={{ ...card, padding: pad }}>
          <div style={{ opacity: 0.8, fontSize: labelFs }}>Closed deals (pilots)</div>
          <div style={{ fontSize: fs, fontWeight: 700 }}>{pilot.closedDealsAcrossPilots ?? "—"}</div>
        </div>
      </div>
    </section>
  );
}

export function InvestorHighlights(props: { highlights: string[] }) {
  return (
    <>
      <h2 style={{ marginTop: "1.25rem" }}>Highlights</h2>
      <ul>
        {props.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
    </>
  );
}
