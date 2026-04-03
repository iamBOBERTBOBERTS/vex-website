"use client";

import { AgentStatusChip } from "@vex/ui";
import { useReveal } from "@/hooks/useReveal";
import styles from "./AutonomousAgentsShowcase.module.css";

const AGENTS = [
  {
    name: "Auction facilitator",
    task: "Sealed-bid pacing, reserve checks, and buyer qualification for consignment lanes.",
    state: "running" as const,
    meta: "Human gate on final hammer",
  },
  {
    name: "Lead nurture",
    task: "Routing marketplace inquiries into CRM sequences with tenant-scoped consent.",
    state: "running" as const,
    meta: "SLA · sub-2m first touch",
  },
  {
    name: "Inventory rebalancer",
    task: "Cross-rooftop suggestions from demand signals and aged-unit policy.",
    state: "idle" as const,
    meta: "Awaiting dealer policy pack",
  },
  {
    name: "Compliance sentinel",
    task: "Payroll + accounting anomaly watch; immutable audit trail on critical mutations.",
    state: "review" as const,
    meta: "2 exceptions · staff review",
  },
];

export function AutonomousAgentsShowcase() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className={styles.section} id="agents" aria-labelledby="agents-heading" data-reveal>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Autonomous operations</p>
        <h2 className={styles.title} id="agents-heading">
          AI agents with enterprise guardrails
        </h2>
        <p className={styles.lede}>
          Auctions, lead flow, inventory, payroll, and reconciliation run as tenant-scoped jobs — high-value decisions stay
          with your people.
        </p>
      </header>
      <div className={styles.grid}>
        {AGENTS.map((a) => (
          <article key={a.name} className={styles.card}>
            <AgentStatusChip state={a.state}>
              {a.state === "running" ? "Active" : a.state === "review" ? "Review" : "Standby"}
            </AgentStatusChip>
            <h3 className={styles.agentName}>{a.name}</h3>
            <p className={styles.task}>{a.task}</p>
            <p className={styles.meta}>{a.meta}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
