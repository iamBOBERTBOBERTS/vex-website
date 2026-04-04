"use client";

import {
  InvestorFinancialSnapshot,
  InvestorHighlights,
  InvestorNarrativeBlocks,
  InvestorPilotMetricsGrid,
  InvestorTokenHint,
} from "@/components/investor/InvestorDeckBlocks";
import { useInvestorDeckData } from "@/hooks/useInvestorDeckData";

export default function InvestorPage() {
  const { data, pilot, pilotErr, err, token, pilotSource } = useInvestorDeckData();

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Investor data room (view only)</h1>

      <InvestorNarrativeBlocks variant="data-room" />
      <InvestorTokenHint hasToken={Boolean(token)} />

      {err && <p style={{ color: "#f66" }}>{err}</p>}
      {pilotErr && <p style={{ color: "#f90", fontSize: "0.9rem" }}>{pilotErr}</p>}

      {data && (
        <>
          <InvestorFinancialSnapshot data={data} />
          {pilot && <InvestorPilotMetricsGrid pilot={pilot} pilotSource={pilotSource} compact />}
          <InvestorHighlights highlights={data.highlights} />
        </>
      )}

      {!data && pilot && <InvestorPilotMetricsGrid pilot={pilot} pilotSource={pilotSource} compact />}

      {!data && !pilot && !err && !pilotErr && token && (
        <p style={{ color: "var(--text-muted, #888)" }}>Loading investor package…</p>
      )}
    </main>
  );
}
