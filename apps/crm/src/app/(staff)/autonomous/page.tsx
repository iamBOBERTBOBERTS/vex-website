"use client";

import { VexAnimatedMetric, VexPageHeader, VexPanel } from "@vex/ui";

export default function AutonomousDashboardPage() {
  return (
    <main className="crm-shell">
      <VexPageHeader title="Autonomous Dealer OS v2" subtitle="Monitor workflow orchestration, decision trails, and guardrails." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "0.85rem", marginBottom: "1rem" }}>
        <VexAnimatedMetric label="Workflow" value="Daily valuation sweep" />
        <VexAnimatedMetric label="Status" value="Running" />
        <VexAnimatedMetric label="Circuit breaker" value="Healthy" />
        <VexAnimatedMetric label="Parallel limit" value="50 / tenant" />
      </div>
      <VexPanel style={{ padding: "1rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>
          Autonomous operations remain tenant-scoped and auditable, with manual override pathways for protected workflows.
        </p>
      </VexPanel>
    </main>
  );
}
