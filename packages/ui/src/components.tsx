import type { CSSProperties, ReactNode } from "react";
import { vexEnterpriseTokens, vexThemeTokens } from "./tokens.js";

export function VexPanel({
  children,
  style,
  strong = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  strong?: boolean;
}) {
  return (
    <section
      style={{
        background: strong ? "var(--bg-card-strong, rgba(19,27,39,0.9))" : "var(--bg-card, rgba(16,22,32,0.68))",
        border: "1px solid var(--line, rgba(153,172,207,0.22))",
        borderRadius: 16,
        boxShadow: "0 12px 32px rgba(2,4,8,0.45)",
        backdropFilter: "blur(14px)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function VexPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "0.9rem", marginBottom: "1rem" }}>
      <div>
        <h1 style={{ color: "var(--text-primary)", marginBottom: "0.3rem" }}>{title}</h1>
        {subtitle ? <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function VexMetricCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <VexPanel strong style={{ padding: "1rem" }}>
      <div style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>{label}</div>
      <div style={{ marginTop: "0.3rem", color: "var(--text-primary)", fontSize: "1.4rem", fontWeight: 700 }}>{value}</div>
    </VexPanel>
  );
}

export function VexChartShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <VexPanel style={{ padding: "1rem", minHeight: 320 }}>
      <h2 style={{ color: "var(--text-primary)", fontSize: "1rem", marginBottom: "0.75rem" }}>{title}</h2>
      {children}
    </VexPanel>
  );
}

export function VexAnimatedMetric({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return (
    <VexPanel strong style={{ padding: "0.95rem", transition: "transform .2s ease, box-shadow .2s ease" }}>
      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ marginTop: "0.25rem", color: "var(--text-primary)", fontWeight: 700, fontSize: "1.25rem" }}>{value}</div>
      {note ? <div style={{ marginTop: "0.25rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>{note}</div> : null}
    </VexPanel>
  );
}

export function VexTrustBadge({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 28,
        padding: "0.2rem 0.55rem",
        borderRadius: 999,
        border: "1px solid var(--line, rgba(153,172,207,0.22))",
        background: "var(--accent-soft, rgba(97,193,255,0.14))",
        color: "var(--text-primary)",
        fontSize: "0.75rem",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

export function VexDataTable({ children }: { children: ReactNode }) {
  return (
    <VexPanel style={{ padding: "0.35rem 0.8rem 0.8rem" }}>
      <table>{children}</table>
    </VexPanel>
  );
}

export function PremiumMicroInteractionWrapper({ children }: { children: ReactNode }) {
  return <div style={{ transition: "transform .22s ease, box-shadow .22s ease" }}>{children}</div>;
}

/** Dense DMS-style metric tile with cinematic glass treatment. */
export function EnterpriseWidgetCard({
  label,
  value,
  meta,
  accent,
}: {
  label: string;
  value: ReactNode;
  meta?: string;
  accent?: "neutral" | "gold" | "cyan";
}) {
  const accentBorder =
    accent === "gold"
      ? vexEnterpriseTokens.metallicEdge
      : accent === "cyan"
        ? "rgba(97, 193, 255, 0.35)"
        : vexThemeTokens.borderSubtle;
  return (
    <div
      style={{
        padding: "0.85rem 1rem",
        borderRadius: vexThemeTokens.radiusMd,
        background: `linear-gradient(165deg, ${vexEnterpriseTokens.cockpitGlass}, ${vexEnterpriseTokens.cockpitInset})`,
        border: `1px solid ${accentBorder}`,
        boxShadow: "0 12px 40px rgba(2, 4, 8, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div
        style={{
          fontSize: "0.68rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text-muted, rgba(168, 174, 191, 0.9))",
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: "0.35rem", color: "var(--text-primary, #f4f2ec)", fontWeight: 700, fontSize: "1.05rem" }}>{value}</div>
      {meta ? (
        <div style={{ marginTop: "0.3rem", fontSize: "0.78rem", color: "var(--text-muted, rgba(168, 174, 191, 0.85))" }}>{meta}</div>
      ) : null}
    </div>
  );
}

export function AgentStatusChip({
  state,
  children,
}: {
  state: "running" | "idle" | "review";
  children: ReactNode;
}) {
  const bg =
    state === "running"
      ? vexEnterpriseTokens.agentRunning
      : state === "review"
        ? "rgba(201, 169, 98, 0.2)"
        : vexEnterpriseTokens.agentIdle;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.2rem 0.55rem",
        borderRadius: 999,
        fontSize: "0.68rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: bg,
        border: "1px solid var(--line, rgba(153,172,207,0.22))",
        color: "var(--text-primary, #f4f2ec)",
      }}
    >
      {children}
    </span>
  );
}

export function PaymentTrustChip({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 30,
        padding: "0.25rem 0.7rem",
        borderRadius: 999,
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.04em",
        background: vexEnterpriseTokens.paymentFiat,
        border: `1px solid ${vexEnterpriseTokens.metallicEdgeSoft}`,
        color: "var(--text-secondary, rgba(220, 224, 235, 0.95))",
      }}
    >
      {children}
    </span>
  );
}
