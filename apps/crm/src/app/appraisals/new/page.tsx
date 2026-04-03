"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAppraisalSchema, type AppraisalValuateResponse } from "@vex/shared";
import { useAuth } from "@/contexts/AuthContext";
import { createAppraisalRecord, getCustomers, getCurrentTenantBilling, getInventory, valuateAppraisal } from "@/lib/api";

const VAL_DRAFT_PREFIX = "vex_crm_appraisal_val_draft";

function valuationDraftKey(tenantId: string) {
  return `${VAL_DRAFT_PREFIX}_${tenantId}`;
}

type ValuationForm = {
  vin?: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: "excellent" | "good" | "fair" | "poor";
  zipCode: string;
};

type FormValues = {
  vehicleId?: string;
  customerId?: string;
  notes?: string;
  status?: "pending" | "completed" | "cancelled";
};

function NewAppraisalPageInner() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const preVehicleId = searchParams.get("vehicleId") ?? undefined;

  const [vehicles, setVehicles] = useState<{ id: string; label: string }[]>([]);
  const [customers, setCustomers] = useState<{ id: string; label: string }[]>([]);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string>("");
  const [valuation, setValuation] = useState<AppraisalValuateResponse | null>(null);
  const [valuationErr, setValuationErr] = useState<string | null>(null);
  const [valuating, setValuating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [valForm, setValForm] = useState<ValuationForm>({
    vin: "",
    make: "",
    model: "",
    year: new Date().getFullYear() - 1,
    mileage: 30000,
    condition: "good",
    zipCode: "90210",
  });

  const valReady = useMemo(() => !!tenantId && !!valForm.make && !!valForm.model && valForm.zipCode.length === 5, [tenantId, valForm]);

  const runValuation = async () => {
    if (!token || !valReady) return;
    setValuationErr(null);
    setValuating(true);
    try {
      const v = await valuateAppraisal(token, { ...valForm, tenantId });
      setValuation(v);
    } catch (e) {
      setValuationErr(e instanceof Error ? e.message : "Valuation failed");
    } finally {
      setValuating(false);
    }
  };

  const scheduleValuation = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runValuation();
    }, 5000);
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createAppraisalSchema),
    defaultValues: { status: "pending", vehicleId: preVehicleId },
  });

  useEffect(() => {
    if (!tenantId) return;
    try {
      const raw = localStorage.getItem(valuationDraftKey(tenantId));
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ValuationForm>;
      setValForm((prev) => ({
        ...prev,
        ...parsed,
        vin: typeof parsed.vin === "string" ? parsed.vin : prev.vin,
        make: typeof parsed.make === "string" ? parsed.make : prev.make,
        model: typeof parsed.model === "string" ? parsed.model : prev.model,
        year: typeof parsed.year === "number" && !Number.isNaN(parsed.year) ? parsed.year : prev.year,
        mileage: typeof parsed.mileage === "number" && !Number.isNaN(parsed.mileage) ? parsed.mileage : prev.mileage,
        condition:
          parsed.condition === "excellent" || parsed.condition === "good" || parsed.condition === "fair" || parsed.condition === "poor"
            ? parsed.condition
            : prev.condition,
        zipCode: typeof parsed.zipCode === "string" ? parsed.zipCode.slice(0, 5) : prev.zipCode,
      }));
    } catch {
      /* ignore corrupt draft */
    }
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(valuationDraftKey(tenantId), JSON.stringify(valForm));
      } catch {
        /* quota / private mode */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [valForm, tenantId]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      getInventory(token).then((r) => {
        const items = (r as { items: Array<{ vehicleId: string; vehicle?: { make: string; model: string; year: number } }> }).items;
        const map = new Map<string, string>();
        for (const it of items) {
          const v = it.vehicle;
          if (v && !map.has(it.vehicleId)) {
            map.set(it.vehicleId, `${v.year} ${v.make} ${v.model}`);
          }
        }
        setVehicles([...map.entries()].map(([id, label]) => ({ id, label })));
      }),
      getCurrentTenantBilling(token).then((b) => setTenantId((b as { id: string }).id)),
      getCustomers(token).then((r) => {
        const list = (r as { items: Array<{ id: string; name?: string | null; email?: string | null }> }).items;
        setCustomers(
          list.map((c) => ({
            id: c.id,
            label: c.name ?? c.email ?? c.id,
          }))
        );
      }),
    ]).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (preVehicleId) setValue("vehicleId", preVehicleId);
  }, [preVehicleId, setValue]);

  const onSubmit = async (data: FormValues) => {
    if (!token) return;
    setSubmitErr(null);
    try {
      const created = await createAppraisalRecord(token, {
        vehicleId: data.vehicleId?.trim() || undefined,
        customerId: data.customerId?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        status: data.status,
      });
      if (valuation && valuation.appraisalId && valuation.appraisalId === created.id) {
        // no-op
      }
      try {
        if (tenantId) localStorage.removeItem(valuationDraftKey(tenantId));
      } catch {
        /* ignore */
      }
      window.location.href = `/appraisals/${created.id}`;
    } catch (e) {
      setSubmitErr(e instanceof Error ? e.message : "Failed to create");
    }
  };

  return (
    <main style={{ padding: "1.5rem", maxWidth: "560px", margin: "0 auto" }}>
      <Link href="/appraisals" style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
        ← Appraisals
      </Link>
      <h1 style={{ margin: "1rem 0", color: "var(--text-primary)" }}>New appraisal</h1>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <span>Vehicle (from inventory catalog)</span>
          <select {...register("vehicleId")} style={{ padding: "0.5rem", background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <option value="">— Optional —</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <span>Customer</span>
          <select {...register("customerId")} style={{ padding: "0.5rem", background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <option value="">— Optional —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <section style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.9rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Auto valuation</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <input placeholder="VIN (optional)" value={valForm.vin ?? ""} onChange={(e) => setValForm((v) => ({ ...v, vin: e.target.value.toUpperCase() }))} onBlur={scheduleValuation} />
            <input placeholder="ZIP" value={valForm.zipCode} onChange={(e) => setValForm((v) => ({ ...v, zipCode: e.target.value.slice(0, 5) }))} onBlur={scheduleValuation} />
            <input placeholder="Make" value={valForm.make} onChange={(e) => setValForm((v) => ({ ...v, make: e.target.value }))} onBlur={scheduleValuation} />
            <input placeholder="Model" value={valForm.model} onChange={(e) => setValForm((v) => ({ ...v, model: e.target.value }))} onBlur={scheduleValuation} />
            <input type="number" placeholder="Year" value={valForm.year} onChange={(e) => setValForm((v) => ({ ...v, year: Number(e.target.value) }))} onBlur={scheduleValuation} />
            <input type="number" placeholder="Mileage" value={valForm.mileage} onChange={(e) => setValForm((v) => ({ ...v, mileage: Number(e.target.value) }))} onBlur={scheduleValuation} />
            <select value={valForm.condition} onChange={(e) => setValForm((v) => ({ ...v, condition: e.target.value as ValuationForm["condition"] }))} onBlur={scheduleValuation}>
              <option value="excellent">excellent</option>
              <option value="good">good</option>
              <option value="fair">fair</option>
              <option value="poor">poor</option>
            </select>
            <button type="button" onClick={() => void runValuation()} disabled={valuating || !valReady}>
              {valuating ? "Fetching…" : "Fetch valuation"}
            </button>
          </div>
          {valuation && (
            <div style={{ marginTop: "0.65rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
              <div style={{ padding: "0.5rem", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6 }}>
                Low
                <br />${valuation.valueLow.toLocaleString()}
              </div>
              <div style={{ padding: "0.5rem", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6 }}>
                Avg
                <br />${valuation.valueAvg.toLocaleString()}
              </div>
              <div style={{ padding: "0.5rem", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6 }}>
                High
                <br />${valuation.valueHigh.toLocaleString()}
              </div>
            </div>
          )}
          {valuation && <p style={{ marginTop: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>Source: {valuation.source} · Confidence: {valuation.confidence}%</p>}
          {valuationErr && <p style={{ marginTop: "0.4rem", color: "#f66" }}>{valuationErr} — Try manual entry.</p>}
        </section>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <span>Notes</span>
          <textarea {...register("notes")} rows={4} style={{ padding: "0.5rem", background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid rgba(255,255,255,0.12)" }} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <span>Status</span>
          <select {...register("status")} style={{ padding: "0.5rem", background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <option value="pending">pending</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </label>
        {errors.vehicleId && <p style={{ color: "#f66" }}>{String(errors.vehicleId.message)}</p>}
        {submitErr && <p style={{ color: "#f66" }}>{submitErr}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ padding: "0.65rem", background: "var(--accent)", color: "#111", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}
        >
          {isSubmitting ? "Saving…" : "Create appraisal"}
        </button>
      </form>
    </main>
  );
}

export default function NewAppraisalPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: "1.5rem" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        </main>
      }
    >
      <NewAppraisalPageInner />
    </Suspense>
  );
}
