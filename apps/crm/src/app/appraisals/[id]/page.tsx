"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateAppraisalSchema } from "@vex/shared";
import type { AppraisalOutput } from "@vex/shared";
import { AppraisalPdfButton } from "@/components/AppraisalPdfButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  deleteAppraisalRecord,
  getAppraisalById,
  getCurrentTenantBilling,
  getCustomers,
  getInventory,
  openAppraisalDealDesk,
  updateAppraisalRecord,
} from "@/lib/api";

type FormValues = {
  vehicleId?: string | null;
  customerId?: string | null;
  notes?: string | null;
  status?: string;
  value?: number | null;
};

function dealDeskLabel(status: string) {
  const s = String(status).toLowerCase();
  if (s === "pending") return "Open";
  if (s === "open") return "Open";
  if (s === "accepted") return "Accepted";
  if (s === "rejected") return "Rejected";
  if (s === "negotiating") return "Negotiating";
  if (s === "closed") return "Closed";
  return status;
}

export default function AppraisalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [appraisal, setAppraisal] = useState<AppraisalOutput | null>(null);
  const [tenantName, setTenantName] = useState("Dealer");
  const [vehicles, setVehicles] = useState<{ id: string; label: string }[]>([]);
  const [customers, setCustomers] = useState<{ id: string; label: string }[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [dealDeskNote, setDealDeskNote] = useState("");
  const [dealDeskFeedback, setDealDeskFeedback] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(updateAppraisalSchema),
  });

  useEffect(() => {
    if (!token || !id) return;
    Promise.all([
      getAppraisalById(token, id).then((a) => {
        setAppraisal(a);
        reset({
          vehicleId: a.vehicleId,
          customerId: a.customerId,
          notes: a.notes,
          status: a.status,
          value: a.value,
        });
      }),
      getCurrentTenantBilling(token).then((b) => setTenantName((b as { name?: string }).name ?? "Dealer")),
      getInventory(token).then((r) => {
        const items = (r as {
          items: Array<{
            vehicleId: string;
            vehicle?: { make: string; model: string; year: number };
          }>;
        }).items;
        const map = new Map<string, string>();
        for (const it of items) {
          const v = it.vehicle;
          if (v && !map.has(it.vehicleId)) {
            map.set(it.vehicleId, `${v.year} ${v.make} ${v.model}`);
          }
        }
        setVehicles([...map.entries()].map(([vid, label]) => ({ id: vid, label })));
      }),
      getCustomers(token).then((r) => {
        const list = (r as { items: Array<{ id: string; name?: string | null; email?: string | null }> }).items;
        setCustomers(
          list.map((c) => ({
            id: c.id,
            label: c.name ?? c.email ?? c.id,
          }))
        );
      }),
    ]).catch(() => setLoadErr("Failed to load appraisal"));
  }, [token, id, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!token || !id) return;
    setSubmitErr(null);
    try {
      const updated = await updateAppraisalRecord(token, id, {
        vehicleId: data.vehicleId,
        customerId: data.customerId,
        notes: data.notes,
        status: data.status,
        value: data.value,
      });
      setAppraisal(updated);
    } catch (e) {
      setSubmitErr(e instanceof Error ? e.message : "Update failed");
    }
  };

  const onDelete = async () => {
    if (!token || !id || !confirm("Delete this appraisal?")) return;
    try {
      await deleteAppraisalRecord(token, id);
      router.replace("/appraisals");
    } catch {
      setSubmitErr("Delete failed");
    }
  };

  const onDealDeskUpdate = async (nextStatus: "ACCEPTED" | "REJECTED" | "CLOSED") => {
    if (!token || !id) return;
    setSubmitErr(null);
    setDealDeskFeedback(null);
    try {
      const response = await openAppraisalDealDesk(token, id, {
        status: nextStatus,
        note: dealDeskNote || undefined,
      });
      setAppraisal((prev) => (prev ? { ...prev, status: nextStatus.toLowerCase() } : prev));
      const hasCloseArtifacts = Boolean(response?.dealDesk?.orderId || response?.dealDesk?.inventoryId);
      setDealDeskFeedback(
        nextStatus === "CLOSED" && hasCloseArtifacts
          ? "Closed: order created, usage billed, revenue event logged."
          : `Deal desk: ${nextStatus}.`
      );
    } catch (e) {
      setSubmitErr(e instanceof Error ? e.message : "Deal desk update failed");
    }
  };

  if (loadErr)
    return (
      <main style={{ padding: "1.5rem" }}>
        <p style={{ color: "#f66" }}>{loadErr}</p>
      </main>
    );
  if (!appraisal)
    return (
      <main style={{ padding: "1.5rem" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      </main>
    );

  return (
    <main style={{ padding: "1.5rem", maxWidth: "560px", margin: "0 auto" }}>
      <Link href="/appraisals" style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
        ← Appraisals
      </Link>
      <h1 style={{ margin: "1rem 0", color: "var(--text-primary)" }}>Appraisal</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>ID: {appraisal.id}</p>

      <div style={{ marginBottom: "1rem" }}>
        <AppraisalPdfButton appraisal={appraisal} tenantName={tenantName} />
      </div>

      <section
        style={{
          marginBottom: "1rem",
          background: "var(--bg-card)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8,
          padding: "0.8rem",
        }}
      >
        <h2 style={{ fontSize: "0.95rem", marginBottom: "0.35rem" }}>Valuation snapshot</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Source: {appraisal.valuationSource ?? "manual"} · Fetched:{" "}
          {appraisal.valuationFetchedAt ? new Date(appraisal.valuationFetchedAt).toLocaleString() : "—"}
        </p>
      </section>

      <section
        style={{
          marginBottom: "1rem",
          background: "var(--bg-card)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8,
          padding: "0.8rem",
        }}
      >
        <h2 style={{ fontSize: "0.95rem", marginBottom: "0.35rem" }}>Deal desk</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
          Status:{" "}
          <strong>{dealDeskLabel(appraisal.status)}</strong>
          <span style={{ marginLeft: "0.5rem", opacity: 0.85 }}>
            (Close creates order + billing usage + revenue log)
          </span>
        </p>
        <textarea
          rows={2}
          placeholder="Internal note (optional)"
          value={dealDeskNote}
          onChange={(e) => setDealDeskNote(e.target.value)}
          style={{ width: "100%", marginTop: "0.5rem" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button type="button" onClick={() => void onDealDeskUpdate("ACCEPTED")}>
            Accept
          </button>
          <button type="button" onClick={() => void onDealDeskUpdate("REJECTED")}>
            Reject
          </button>
          <button type="button" onClick={() => void onDealDeskUpdate("CLOSED")}>
            Close
          </button>
        </div>
        {dealDeskFeedback && <p style={{ color: "#7fffd4", marginTop: "0.5rem" }}>{dealDeskFeedback}</p>}
      </section>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <span>Vehicle</span>
          <select
            {...register("vehicleId")}
            style={{
              padding: "0.5rem",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <option value="">— None —</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <span>Customer</span>
          <select
            {...register("customerId")}
            style={{
              padding: "0.5rem",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <option value="">— None —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <span>Notes</span>
          <textarea
            {...register("notes")}
            rows={4}
            style={{
              padding: "0.5rem",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <span>Status</span>
          <input
            {...register("status")}
            style={{
              padding: "0.5rem",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <span>Value (USD)</span>
          <input
            type="number"
            step="0.01"
            {...register("value", {
              setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
            })}
            style={{
              padding: "0.5rem",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          />
        </label>

        {submitErr && <p style={{ color: "#f66" }}>{submitErr}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "0.65rem",
            background: "var(--accent)",
            color: "#111",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => void onDelete()}
        style={{
          marginTop: "1.5rem",
          padding: "0.5rem 1rem",
          background: "transparent",
          border: "1px solid #f66",
          color: "#f66",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Delete appraisal
      </button>
    </main>
  );
}

