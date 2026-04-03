"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
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

function pipelineLabel(status: string): "Pending" | "In Review" | "Closed" {
  const s = String(status).toLowerCase();
  if (s === "closed" || s === "rejected") return "Closed";
  if (s === "pending") return "Pending";
  return "In Review";
}

function pipelineBadgeStyle(label: ReturnType<typeof pipelineLabel>): CSSProperties {
  const base: CSSProperties = {
    display: "inline-block",
    padding: "0.35rem 0.65rem",
    borderRadius: 8,
    fontSize: "0.85rem",
    fontWeight: 700,
  };
  if (label === "Closed") return { ...base, background: "rgba(148,163,184,0.2)", color: "#e2e8f0", border: "1px solid rgba(148,163,184,0.35)" };
  if (label === "Pending") return { ...base, background: "rgba(251,191,36,0.15)", color: "#fcd34d", border: "1px solid rgba(251,191,36,0.4)" };
  return { ...base, background: "rgba(59,130,246,0.18)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.4)" };
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
  const [dealDeskFeedback, setDealDeskFeedback] = useState<string | null>(null);
  const [dealDeskLoading, setDealDeskLoading] = useState(false);
  const [modalAction, setModalAction] = useState<null | "ACCEPT" | "REJECT" | "CLOSED">(null);
  const [closeModalNote, setCloseModalNote] = useState("");
  const [closeNoteError, setCloseNoteError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const retryDealDeskRef = useRef<(() => void) | null>(null);

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
    setPageLoading(true);
    setLoadErr(null);
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
    ])
      .catch(() => setLoadErr("We couldn’t load this appraisal. You may not have access, or the server is unavailable."))
      .finally(() => setPageLoading(false));
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

  const onDealDeskUpdate = async (nextStatus: "ACCEPTED" | "REJECTED" | "CLOSED", note?: string) => {
    if (!token || !id) return;
    if (nextStatus === "CLOSED") {
      const n = note?.trim() ?? "";
      if (n.length < 3) {
        setCloseNoteError("Enter at least 3 characters for the close note (required for audit).");
        return;
      }
      setCloseNoteError(null);
    }
    setSubmitErr(null);
    setErrorToast(null);
    setDealDeskFeedback(null);
    setDealDeskLoading(true);
    retryDealDeskRef.current = () => void onDealDeskUpdate(nextStatus, note);
    try {
      const response = (await openAppraisalDealDesk(token, id, {
        status: nextStatus,
        note: note?.trim() ? note.trim() : undefined,
      })) as {
        dealDesk?: {
          orderId?: string | null;
          inventoryId?: string | null;
          invoiceNumber?: string | null;
        };
      };
      setAppraisal((prev) => (prev ? { ...prev, status: nextStatus.toLowerCase() } : prev));
      const dd = response?.dealDesk;
      const hasCloseArtifacts = Boolean(dd?.orderId || dd?.inventoryId);
      if (nextStatus === "CLOSED" && hasCloseArtifacts) {
        const oid = dd?.orderId ?? "";
        const inv = dd?.invoiceNumber ? ` · Invoice ${dd.invoiceNumber}` : "";
        setSuccessToast(`Closed successfully. Order ${oid}${inv}. Billing, revenue, and audit records are stored.`);
        setModalAction(null);
        setCloseModalNote("");
        window.setTimeout(() => router.push("/orders"), 1200);
        return;
      }
      setDealDeskFeedback(`Updated: ${nextStatus}.`);
      setModalAction(null);
      setCloseModalNote("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Deal desk update failed";
      setErrorToast(msg);
      setSubmitErr(msg);
    } finally {
      setDealDeskLoading(false);
    }
  };

  if (loadErr)
    return (
      <main style={{ padding: "1.5rem", maxWidth: "560px", margin: "0 auto" }}>
        <p style={{ color: "#f66" }}>{loadErr}</p>
        <button type="button" style={{ marginTop: "0.75rem", fontWeight: 600 }} onClick={() => window.location.reload()}>
          Retry
        </button>
      </main>
    );
  if (pageLoading || !appraisal)
    return (
      <main style={{ padding: "1.5rem", maxWidth: "560px", margin: "0 auto" }} aria-busy="true">
        <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>Loading appraisal…</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {[1, 2, 3, 4, 5].map((k) => (
            <div
              key={k}
              style={{
                height: 18,
                borderRadius: 6,
                background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 100%)",
                backgroundSize: "200% 100%",
                animation: "vex-detail-shimmer 1.3s ease-in-out infinite",
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes vex-detail-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </main>
    );

  return (
    <main style={{ padding: "1.5rem", maxWidth: "560px", margin: "0 auto", position: "relative" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {successToast && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 50,
            maxWidth: "min(420px, 92vw)",
            padding: "0.75rem 1rem",
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(127,255,212,0.4)",
            borderRadius: 8,
            color: "#e2e8f0",
            fontSize: "0.9rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          }}
        >
          {successToast}
        </div>
      )}
      {errorToast && (
        <div
          role="alert"
          style={{
            position: "fixed",
            top: successToast ? "5.5rem" : "1rem",
            right: "1rem",
            zIndex: 50,
            maxWidth: "min(420px, 92vw)",
            padding: "0.75rem 1rem",
            background: "rgba(60,20,20,0.95)",
            border: "1px solid rgba(248,113,113,0.5)",
            borderRadius: 8,
            color: "#fecaca",
            fontSize: "0.9rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          }}
        >
          <p style={{ margin: 0 }}>{errorToast}</p>
          <button
            type="button"
            style={{ marginTop: "0.5rem", fontWeight: 600, cursor: "pointer", color: "#fff" }}
            onClick={() => {
              setErrorToast(null);
              retryDealDeskRef.current?.();
            }}
          >
            Retry
          </button>
        </div>
      )}
      {modalAction && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deal-desk-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => !dealDeskLoading && setModalAction(null)}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: "1.25rem",
              maxWidth: "420px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="deal-desk-modal-title" style={{ margin: "0 0 0.75rem", fontSize: "1.05rem" }}>
              {modalAction === "ACCEPT" && "Accept this appraisal?"}
              {modalAction === "REJECT" && "Reject this appraisal?"}
              {modalAction === "CLOSED" && "Close and create ERP order?"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "0.75rem" }}>
              {modalAction === "CLOSED"
                ? "This runs one server-side flow: inventory + order + invoice + usage billing + revenue event + audit log (tenant-scoped)."
                : "This updates deal desk status for this tenant only."}
            </p>
            {modalAction === "CLOSED" && (
              <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.85rem" }}>Internal note (required for audit)</span>
                <textarea
                  rows={3}
                  value={closeModalNote}
                  onChange={(e) => {
                    setCloseModalNote(e.target.value);
                    setCloseNoteError(null);
                  }}
                  disabled={dealDeskLoading}
                  placeholder="e.g. Pilot close — customer ready to sign"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                />
                {closeNoteError && <p style={{ color: "#f87171", fontSize: "0.82rem", margin: 0 }}>{closeNoteError}</p>}
              </label>
            )}
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button type="button" disabled={dealDeskLoading} onClick={() => setModalAction(null)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={dealDeskLoading}
                style={{
                  padding: "0.5rem 1rem",
                  background: modalAction === "REJECT" ? "transparent" : "var(--accent)",
                  color: modalAction === "REJECT" ? "#f66" : "#111",
                  border: modalAction === "REJECT" ? "1px solid #f66" : "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: dealDeskLoading ? "wait" : "pointer",
                }}
                onClick={() => {
                  if (modalAction === "ACCEPT") void onDealDeskUpdate("ACCEPTED");
                  else if (modalAction === "REJECT") void onDealDeskUpdate("REJECTED");
                  else if (modalAction === "CLOSED") void onDealDeskUpdate("CLOSED", closeModalNote);
                }}
              >
                {dealDeskLoading ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: "2px solid rgba(255,255,255,0.25)",
                        borderTopColor: "#111",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Working…
                  </span>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <Link href="/appraisals" style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
        ← Appraisals
      </Link>
      <h1 style={{ margin: "1rem 0", color: "var(--text-primary)" }}>Appraisal</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.35rem" }}>ID: {appraisal.id}</p>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
        Submitted: {new Date(appraisal.createdAt).toLocaleString()}
      </p>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
        Last updated: {new Date(appraisal.updatedAt).toLocaleString()}
      </p>

      {(() => {
        try {
          const j = JSON.parse(appraisal.notes ?? "{}") as {
            source?: string;
            vin?: string;
            mileage?: number;
            condition?: string;
            notes?: string | null;
            images?: string[];
          };
          if (j.source !== "public_quick_appraisal") return null;
          const imgs = Array.isArray(j.images) ? j.images.filter((u) => typeof u === "string" && u.length > 0) : [];
          return (
            <section
              style={{
                marginBottom: "1rem",
                background: "rgba(201,162,39,0.08)",
                border: "1px solid rgba(201,162,39,0.35)",
                borderRadius: 8,
                padding: "0.85rem",
              }}
            >
              <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>Public Quick Appraisal (intake)</h2>
              <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.88rem", color: "var(--text-muted)" }}>
                <li>Source: Public Quick Appraisal (tenant-scoped)</li>
                {j.vin && <li>VIN: {String(j.vin)}</li>}
                <li>Mileage: {j.mileage != null ? `${j.mileage.toLocaleString()} mi` : "—"}</li>
                <li>Condition: {j.condition ?? "—"}</li>
                {j.notes && String(j.notes).trim() && <li>Customer notes: {String(j.notes)}</li>}
              </ul>
              {imgs.length > 0 && (
                <div style={{ marginTop: "0.75rem" }}>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>Images</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {imgs.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={url}
                          alt=""
                          style={{ width: 96, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)" }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        } catch {
          return null;
        }
      })()}

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
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
          <span>Status:</span>
          <span style={pipelineBadgeStyle(pipelineLabel(appraisal.status))}>{pipelineLabel(appraisal.status)}</span>
          <span style={{ opacity: 0.85 }}>
            Close runs one database transaction: ERP order + invoice + inventory + usage + revenue + audit + notification.
          </span>
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button type="button" disabled={dealDeskLoading} onClick={() => setModalAction("ACCEPT")}>
            Accept
          </button>
          <button type="button" disabled={dealDeskLoading} onClick={() => setModalAction("REJECT")}>
            Reject
          </button>
          <button
            type="button"
            disabled={dealDeskLoading}
            onClick={() => {
              setCloseNoteError(null);
              setModalAction("CLOSED");
            }}
          >
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

