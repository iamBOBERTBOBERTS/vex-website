"use client";

import { useEffect, useMemo, useState } from "react";
import { getInvestorPackageByToken } from "@/lib/api";

type PilotNet = {
  activePilots: number;
  totalPilotAppraisals: number;
  firstBillingEvents: number;
  generatedAt: string;
};

type InvestorPackage = {
  generatedAt: string;
  tenantCount: number;
  activeTenantCount: number;
  mrr: number;
  usageRevenueUsd: number;
  highlights: string[];
  pilotNetwork?: PilotNet;
};

export default function InvestorPage() {
  const [data, setData] = useState<InvestorPackage | null>(null);
  const [livePilot, setLivePilot] = useState<PilotNet | null>(null);
  const [pilotErr, setPilotErr] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    const sp = new URLSearchParams(window.location.search);
    return sp.get("token") ?? "";
  }, []);

  useEffect(() => {
    if (!token) return;
    getInvestorPackageByToken(token).then(setData).catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, [token]);

  useEffect(() => {
    void fetch("/api/investor/pilot-network")
      .then(async (r) => {
        const j = (await r.json().catch(() => ({}))) as { data?: PilotNet; message?: string; code?: string };
        if (!r.ok) {
          setPilotErr(j.message ?? j.code ?? "Live pilot metrics unavailable");
          return;
        }
        if (j.data && typeof j.data.activePilots === "number") setLivePilot(j.data);
      })
      .catch(() => setPilotErr("Could not load live pilot network metrics"));
  }, []);

  const pilot = livePilot ?? data?.pilotNetwork ?? null;

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Investor Data Room (View Only)</h1>
      {!token && <p>Missing investor token.</p>}
      {err && <p style={{ color: "#f66" }}>{err}</p>}
      {pilotErr && <p style={{ color: "#f90", fontSize: "0.9rem" }}>{pilotErr}</p>}
      {data && (
        <>
          <p>Generated: {new Date(data.generatedAt).toLocaleString()}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(180px,1fr))", gap: "1rem" }}>
            <div style={{ background: "#10141f", borderRadius: 8, padding: "1rem" }}>
              <div style={{ opacity: 0.8 }}>MRR</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>${data.mrr.toLocaleString()}</div>
            </div>
            <div style={{ background: "#10141f", borderRadius: 8, padding: "1rem" }}>
              <div style={{ opacity: 0.8 }}>LTV proxy (MRR x 12)</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>${(data.mrr * 12).toLocaleString()}</div>
            </div>
          </div>
          {pilot && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted, #888)", marginBottom: "0.5rem" }}>
                Pilot network · updated {new Date(pilot.generatedAt).toLocaleString()}
                {livePilot ? " · live endpoint" : " · embedded in investor package"}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(120px,1fr))", gap: "0.75rem" }}>
                <div style={{ background: "#10141f", borderRadius: 8, padding: "0.85rem" }}>
                  <div style={{ opacity: 0.75, fontSize: "0.8rem" }}>Active pilots</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{pilot.activePilots}</div>
                </div>
                <div style={{ background: "#10141f", borderRadius: 8, padding: "0.85rem" }}>
                  <div style={{ opacity: 0.75, fontSize: "0.8rem" }}>Pilot appraisals</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{pilot.totalPilotAppraisals}</div>
                </div>
                <div style={{ background: "#10141f", borderRadius: 8, padding: "0.85rem" }}>
                  <div style={{ opacity: 0.75, fontSize: "0.8rem" }}>First billing</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{pilot.firstBillingEvents}</div>
                </div>
              </div>
            </div>
          )}
          <h2 style={{ marginTop: "1.25rem" }}>Highlights</h2>
          <ul>
            {data.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
