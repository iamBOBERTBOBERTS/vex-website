"use client";

import type { RaisePackage } from "@vex/shared";
import { useEffect, useMemo, useState } from "react";
import { getInvestorPackageByToken } from "@/lib/api";

export function useInvestorDeckData() {
  const [data, setData] = useState<RaisePackage | null>(null);
  const [livePilot, setLivePilot] = useState<RaisePackage["pilotNetwork"] | null>(null);
  const [pilotErr, setPilotErr] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("token") ?? "";
  }, []);

  useEffect(() => {
    if (!token) return;
    void getInvestorPackageByToken(token).then(setData).catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, [token]);

  useEffect(() => {
    void fetch("/api/investor/pilot-network")
      .then(async (r) => {
        const j = (await r.json().catch(() => ({}))) as {
          data?: RaisePackage["pilotNetwork"];
          message?: string;
          code?: string;
        };
        if (!r.ok) {
          setPilotErr(j.message ?? j.code ?? "Live pilot metrics unavailable");
          return;
        }
        if (j.data && typeof j.data.activePilots === "number") setLivePilot(j.data);
      })
      .catch(() => setPilotErr("Could not load live pilot network metrics"));
  }, []);

  const pilot = livePilot ?? data?.pilotNetwork ?? null;
  const pilotSource: "live" | "embedded" | null =
    pilot == null ? null : livePilot ? "live" : data?.pilotNetwork ? "embedded" : null;

  return { data, pilot, pilotErr, err, token, pilotSource };
}
