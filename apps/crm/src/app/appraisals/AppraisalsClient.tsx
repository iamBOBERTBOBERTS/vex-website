"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { VexSkeletonTableRows } from "@/components/VexSkeleton";
import { getCurrentTenantBilling, listAppraisals } from "@/lib/api";
import { type AppraisalOutput, isDealDeskRole } from "@vex/shared";
import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** IDs for which the "new public appraisal" banner was dismissed, auto-dismissed, or opened from the banner link. */
const LS_BANNER_ACK_KEY = "vex_dealdesk_public_appraisal_banner_ack_v1";
const WEB_BASE = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

type PublicNotes = {
  vin?: string | null;
  mileage?: number | null;
  condition?: string | null;
  notes?: string | null;
  source?: string;
};

function parsePublicNotes(notes: string | null | undefined): PublicNotes | null {
  if (!notes) return null;
  try {
    const j = JSON.parse(notes) as PublicNotes;
    if (j.source === "public_quick_appraisal") return j;
  } catch {
    return null;
  }
  return null;
}

export function isPublicQuickAppraisal(a: AppraisalOutput): boolean {
  return parsePublicNotes(a.notes) != null;
}

function vinDisplay(a: AppraisalOutput): string {
  const pub = parsePublicNotes(a.notes);
  if (pub?.vin) return String(pub.vin);
  return "N/A";
}

function fullNotesText(a: AppraisalOutput): string {
  const pub = parsePublicNotes(a.notes);
  if (pub?.notes && String(pub.notes).trim()) return String(pub.notes).trim();
  if (!a.notes) return "";
  try {
    const j = JSON.parse(a.notes) as { notes?: string };
    if (j.notes) return String(j.notes).trim();
  } catch {
    return a.notes;
  }
  return a.notes;
}

function notesPreview80(a: AppraisalOutput): string {
  const full = fullNotesText(a);
  if (!full) return "—";
  if (full.length <= 80) return full;
  return `${full.slice(0, 80)}...`;
}

/** Human-friendly relative submission time (matches "2 min ago" style). */
function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const sec = Math.round(diffMs / 1000);
  if (sec < 45) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `${hr} hr ago`;
  const days = Math.round(hr / 24);
  if (days < 14) return `${days} days ago`;
  return d.toLocaleDateString();
}

function conditionKey(raw: string | null | undefined): string {
  return String(raw ?? "").trim().toLowerCase();
}

function conditionBadgeStyle(cond: string | null | undefined): CSSProperties {
  const k = conditionKey(cond);
  const base: CSSProperties = {
    display: "inline-block",
    padding: "0.2rem 0.5rem",
    borderRadius: 6,
    fontSize: "0.72rem",
    fontWeight: 600,
    textTransform: "capitalize" as const,
    whiteSpace: "nowrap",
  };
  if (k === "excellent") return { ...base, background: "rgba(34,197,94,0.2)", color: "#86efac", border: "1px solid rgba(34,197,94,0.45)" };
  if (k === "good") return { ...base, background: "rgba(59,130,246,0.2)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.45)" };
  if (k === "fair") return { ...base, background: "rgba(234,179,8,0.2)", color: "#fde047", border: "1px solid rgba(234,179,8,0.45)" };
  if (k === "poor") return { ...base, background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.45)" };
  return { ...base, background: "rgba(148,163,184,0.15)", color: "#cbd5e1", border: "1px solid rgba(148,163,184,0.3)" };
}

function conditionAriaLabel(cond: string | null | undefined): string {
  if (!cond) return "Condition not provided";
  return `Condition: ${cond}`;
}

function pipelineLabel(status: string): "Pending" | "In Review" | "Closed" {
  const s = String(status).toLowerCase();
  if (s === "closed" || s === "rejected") return "Closed";
  if (s === "pending") return "Pending";
  return "In Review";
}

function pipelineBadgeStyle(label: ReturnType<typeof pipelineLabel>): CSSProperties {
  const base: CSSProperties = {
    display: "inline-block",
    padding: "0.2rem 0.55rem",
    borderRadius: 6,
    fontSize: "0.75rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  };
  if (label === "Closed") return { ...base, background: "rgba(148,163,184,0.2)", color: "#e2e8f0", border: "1px solid rgba(148,163,184,0.35)" };
  if (label === "Pending") return { ...base, background: "rgba(251,191,36,0.15)", color: "#fcd34d", border: "1px solid rgba(251,191,36,0.4)" };
  return { ...base, background: "rgba(59,130,246,0.18)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.4)" };
}

function loadBannerAck(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(LS_BANNER_ACK_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveBannerAck(ids: Set<string>) {
  try {
    window.localStorage.setItem(LS_BANNER_ACK_KEY, JSON.stringify([...ids]));
  } catch {
    /* quota */
  }
}

function lastUpdatedLabel(seconds: number): string {
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  const m = Math.floor(seconds / 60);
  if (m === 1) return "1 minute ago";
  if (m < 60) return `${m} minutes ago`;
  const h = Math.floor(m / 60);
  return h === 1 ? "1 hour ago" : `${h} hours ago`;
}

export function AppraisalsClient() {
  const router = useRouter();
  const { token, role, loading } = useAuth();
  const [bannerAppraisalId, setBannerAppraisalId] = useState<string | null>(null);
  const [inviteToast, setInviteToast] = useState<string | null>(null);
  const [lastFetchAt, setLastFetchAt] = useState<number | null>(null);
  const [, setClockTick] = useState(0);
  const ackRef = useRef<Set<string>>(new Set());
  const listErrorRetryRef = useRef<HTMLButtonElement>(null);

  const { data: tenantRow } = useQuery({
    queryKey: ["tenantBilling", token],
    queryFn: () => getCurrentTenantBilling(token!),
    enabled: !!token && !!role && isDealDeskRole(role),
  });

  const brandedAppraisalUrl = useMemo(() => {
    const tid = tenantRow && typeof tenantRow === "object" && "id" in tenantRow ? String((tenantRow as { id: string }).id) : "";
    if (!tid) return `${WEB_BASE}/appraisal`;
    return `${WEB_BASE}/appraisal?tenantId=${encodeURIComponent(tid)}`;
  }, [tenantRow]);

  const { data, error, isLoading, isFetching, isFetched, refetch } = useQuery({
    queryKey: ["appraisals", token],
    queryFn: async () => {
      if (!token) return { items: [] as AppraisalOutput[] };
      return listAppraisals(token);
    },
    enabled: !!token && !!role && isDealDeskRole(role),
  });

  const items = data?.items ?? [];
  const errMsg = error instanceof Error ? error.message : error ? "We couldn’t load appraisals. Check your connection and try again." : null;

  /** Poll every 15s with cleanup (per spec); React Query refetch only. */
  useEffect(() => {
    if (!token || !role || !isDealDeskRole(role)) return;
    const id = window.setInterval(() => {
      void refetch();
    }, 15_000);
    return () => window.clearInterval(id);
  }, [token, role, refetch]);

  useEffect(() => {
    if (!isFetching && data && !error) {
      setLastFetchAt(Date.now());
    }
  }, [isFetching, data, error]);

  useEffect(() => {
    const id = window.setInterval(() => setClockTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const secondsSinceFetch = lastFetchAt != null ? Math.max(0, Math.floor((Date.now() - lastFetchAt) / 1000)) : null;

  const acknowledgeBanner = useCallback((appraisalId: string) => {
    const next = loadBannerAck();
    next.add(appraisalId);
    ackRef.current = next;
    saveBannerAck(next);
    setBannerAppraisalId((cur) => (cur === appraisalId ? null : cur));
  }, []);

  useEffect(() => {
    if (!isFetched || typeof window === "undefined") return;

    /** Once per browser tab session: if user has never acked any banner, pre-ack existing queue rows so pilots are not spammed after refresh. New IDs still notify. */
    if (!sessionStorage.getItem("vex_dealdesk_banner_session_hydrated")) {
      sessionStorage.setItem("vex_dealdesk_banner_session_hydrated", "1");
      const ack = loadBannerAck();
      if (ack.size === 0 && items.length > 0) {
        for (const a of items) {
          if (isPublicQuickAppraisal(a)) ack.add(a.id);
        }
        saveBannerAck(ack);
      }
    }

    const ack = loadBannerAck();
    ackRef.current = ack;
    const candidate = items.find((a) => isPublicQuickAppraisal(a) && !ack.has(a.id));
    if (candidate && bannerAppraisalId === null) {
      setBannerAppraisalId(candidate.id);
    }
    if (bannerAppraisalId !== null && ack.has(bannerAppraisalId)) {
      setBannerAppraisalId(null);
    }
  }, [items, isFetched, bannerAppraisalId]);

  useEffect(() => {
    if (!bannerAppraisalId) return;
    const t = window.setTimeout(() => {
      acknowledgeBanner(bannerAppraisalId);
    }, 8000);
    return () => window.clearTimeout(t);
  }, [bannerAppraisalId, acknowledgeBanner]);

  useEffect(() => {
    if (!inviteToast) return;
    const t = window.setTimeout(() => setInviteToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [inviteToast]);

  /** Move focus to retry when list fetch fails so keyboard and SR users get an immediate recovery path. */
  useEffect(() => {
    if (!errMsg) return;
    const t = window.setTimeout(() => listErrorRetryRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [errMsg]);

  const onRowNavigate = (id: string) => {
    router.push(`/appraisals/${id}`);
  };

  const onCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(brandedAppraisalUrl);
      setInviteToast("Branded appraisal link copied to clipboard.");
    } catch {
      setInviteToast("Could not copy automatically. Select the link below and copy manually.");
    }
  };

  const tableRows = useMemo(
    () =>
      items.map((a) => {
        const pub = parsePublicNotes(a.notes);
        const pl = pipelineLabel(a.status);
        return { a, pub, pl };
      }),
    [items]
  );

  if (loading) {
    return (
      <main style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }} aria-busy="true">
        <p style={{ color: "var(--text-muted)" }}>Loading session…</p>
      </main>
    );
  }
  if (!role || !isDealDeskRole(role)) {
    return (
      <main style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1>Access restricted</h1>
        <p style={{ color: "var(--text-muted)" }}>The deal desk queue is limited to staff and dealer administrators.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {inviteToast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "1.25rem",
            right: "1.25rem",
            zIndex: 60,
            maxWidth: "min(380px, 92vw)",
            padding: "0.75rem 1rem",
            background: "rgba(15,23,42,0.96)",
            border: "1px solid rgba(127,255,212,0.45)",
            borderRadius: 8,
            color: "#e2e8f0",
            fontSize: "0.9rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {inviteToast}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ color: "var(--text-primary)", margin: 0 }} id="dealdesk-heading">
            Deal desk — appraisals
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.35rem" }}>
            Data loads from <code style={{ fontSize: "0.82rem" }}>GET /dealer/appraisals</code> — the API uses your JWT and tenant-scoped Prisma (AsyncLocalStorage); no cross-tenant reads.
          </p>
          <p
            style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.35rem" }}
            aria-live="polite"
            aria-atomic="true"
          >
            Last updated: {secondsSinceFetch != null ? lastUpdatedLabel(secondsSinceFetch) : "—"} · Auto-refresh every 15 seconds
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label={isFetching ? "Refreshing appraisals list" : "Refresh appraisals list now"}
            style={{
              padding: "0.5rem 1rem",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: isFetching ? "wait" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
            }}
          >
            {isFetching ? (
              <span
                aria-hidden
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(255,255,255,0.25)",
                  borderTopColor: "var(--accent)",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            ) : null}
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
          <Link
            href="/appraisals/new"
            aria-label="Create new internal appraisal"
            style={{
              padding: "0.5rem 1rem",
              background: "var(--accent)",
              color: "#111",
              borderRadius: "6px",
              fontWeight: 600,
            }}
          >
            New appraisal
          </Link>
        </div>
      </div>

      {bannerAppraisalId && (
        <div
          role="status"
          aria-live="polite"
          aria-labelledby="new-public-banner-title"
          style={{
            marginBottom: "0.9rem",
            padding: "0.65rem 0.8rem",
            border: "1px solid rgba(127,255,212,0.35)",
            background: "rgba(127,255,212,0.08)",
            borderRadius: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <p id="new-public-banner-title" style={{ margin: 0, color: "#7fffd4" }}>
            New public appraisal received —{" "}
            <Link
              href={`/appraisals/${bannerAppraisalId}`}
              style={{ color: "#7fffd4", fontWeight: 700, textDecoration: "underline" }}
              onClick={() => acknowledgeBanner(bannerAppraisalId)}
            >
              open appraisal detail
            </Link>
          </p>
          <button
            type="button"
            onClick={() => acknowledgeBanner(bannerAppraisalId)}
            aria-label="Dismiss new appraisal notification"
            style={{
              padding: "0.35rem 0.65rem",
              background: "transparent",
              border: "1px solid rgba(127,255,212,0.45)",
              color: "#7fffd4",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {errMsg && (
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: 8,
            border: "1px solid rgba(248,113,113,0.45)",
            background: "rgba(248,113,113,0.08)",
            color: "#fecaca",
          }}
        >
          <p style={{ margin: 0 }}>{errMsg}</p>
          <button
            ref={listErrorRetryRef}
            type="button"
            onClick={() => void refetch()}
            aria-label="Retry loading appraisals"
            style={{ marginTop: "0.5rem", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      )}

      {isLoading && !data && <VexSkeletonTableRows rows={5} columns={8} />}

      {!isLoading || data ? (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}
            aria-labelledby="dealdesk-heading"
            role="table"
          >
            <caption className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              Appraisal queue: columns are identifier, submission time, source, vehicle identification number, mileage, condition, notes preview, and pipeline status.
            </caption>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                <th scope="col" style={{ padding: "0.5rem" }}>
                  Appraisal ID
                </th>
                <th scope="col" style={{ padding: "0.5rem" }}>
                  Submission date
                </th>
                <th scope="col" style={{ padding: "0.5rem" }}>
                  Source
                </th>
                <th scope="col" style={{ padding: "0.5rem" }}>
                  VIN
                </th>
                <th scope="col" style={{ padding: "0.5rem" }}>
                  Mileage
                </th>
                <th scope="col" style={{ padding: "0.5rem" }}>
                  Condition
                </th>
                <th scope="col" style={{ padding: "0.5rem" }}>
                  Notes
                </th>
                <th scope="col" style={{ padding: "0.5rem" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(({ a, pub, pl }) => {
                const cond = pub?.condition ?? null;
                const notesFull = fullNotesText(a);
                const preview = notesPreview80(a);
                const plAria = `Pipeline status: ${pl}`;
                return (
                  <tr
                    key={a.id}
                    onClick={() => onRowNavigate(a.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowNavigate(a.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Appraisal ${a.id.slice(0, 8)}…, ${pl}. Open detail.`}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer",
                    }}
                  >
                    <td style={{ padding: "0.5rem" }}>
                      <Link
                        href={`/appraisals/${a.id}`}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Open appraisal detail for ${a.id}`}
                        style={{
                          fontFamily: "ui-monospace, monospace",
                          fontSize: "0.8rem",
                          color: "var(--accent)",
                          textDecoration: "underline",
                          fontWeight: 600,
                        }}
                        title={a.id}
                      >
                        {a.id.slice(0, 10)}…
                      </Link>
                    </td>
                    <td
                      style={{ padding: "0.5rem", whiteSpace: "nowrap" }}
                      title={`Full timestamp: ${new Date(a.createdAt).toLocaleString()}`}
                    >
                      <time dateTime={a.createdAt}>{relativeTime(a.createdAt)}</time>
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      {pub ? (
                        <span
                          aria-label="Source: Public Quick Appraisal"
                          style={{
                            display: "inline-block",
                            padding: "0.2rem 0.45rem",
                            borderRadius: 6,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            background: "rgba(201,162,39,0.15)",
                            color: "#fbbf24",
                            border: "1px solid rgba(201,162,39,0.35)",
                          }}
                        >
                          Public Quick Appraisal
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>Internal</span>
                      )}
                    </td>
                    <td style={{ padding: "0.5rem", fontSize: "0.82rem" }}>{vinDisplay(a)}</td>
                    <td style={{ padding: "0.5rem" }}>{pub?.mileage != null ? `${Number(pub.mileage).toLocaleString()} mi` : "—"}</td>
                    <td style={{ padding: "0.5rem" }}>
                      {cond ? (
                        <span style={conditionBadgeStyle(cond)} role="status" aria-label={conditionAriaLabel(cond)}>
                          {cond}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td
                      style={{ padding: "0.5rem", maxWidth: 220, color: "var(--text-muted)" }}
                      title={notesFull || undefined}
                    >
                      {preview}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <span style={pipelineBadgeStyle(pl)} role="status" aria-label={plAria}>
                        {pl}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {items.length === 0 && !errMsg && !isLoading && (
            <div
              style={{
                marginTop: "2rem",
                padding: "2rem 1.25rem",
                textAlign: "center",
                border: "1px dashed rgba(255,255,255,0.15)",
                borderRadius: 12,
                background: "rgba(0,0,0,0.15)",
              }}
            >
              <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "1rem" }}>No appraisals yet.</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
                Share your branded public appraisal link so customers can submit vehicles from the web.
              </p>
              <button
                type="button"
                onClick={() => void onCopyInvite()}
                aria-label="Copy branded public appraisal link to clipboard"
                style={{
                  padding: "0.65rem 1.25rem",
                  background: "var(--accent)",
                  color: "#111",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                }}
              >
                Invite First Customer
              </button>
              <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)", wordBreak: "break-all" }}>{brandedAppraisalUrl}</p>
            </div>
          )}
        </div>
      ) : null}

      <div aria-live="polite" aria-atomic="true" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {tableRows.length > 0 ? `${tableRows.length} appraisals listed` : ""}
      </div>
    </main>
  );
}
