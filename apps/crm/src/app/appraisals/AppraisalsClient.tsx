"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentTenantBilling, listAppraisals } from "@/lib/api";
import { type AppraisalOutput, isDealDeskRole } from "@vex/shared";
import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

const LS_SEEN_KEY = "vex_dealdesk_seen_appraisal_ids_v1";
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

/** Full notes text for tooltip (public intake or raw). */
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

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const sec = Math.round(diffMs / 1000);
  if (sec < 45) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `${hr}h ago`;
  const days = Math.round(hr / 24);
  if (days < 14) return `${days}d ago`;
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

/** Pipeline labels for dealer deal desk (not raw DB enum). */
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

function loadSeenFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(LS_SEEN_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveSeenToStorage(ids: Set<string>) {
  try {
    window.localStorage.setItem(LS_SEEN_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore quota */
  }
}

function ShimmerTable() {
  const rowStyle: CSSProperties = {
    height: 40,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  };
  const cell = (w: string): CSSProperties => ({
    padding: "0.5rem",
    width: w,
  });
  const bar: CSSProperties = {
    height: 14,
    borderRadius: 4,
    background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 100%)",
    backgroundSize: "200% 100%",
    animation: "vex-dealdesk-shimmer 1.35s ease-in-out infinite",
  };
  return (
    <>
      <style>{`
        @keyframes vex-dealdesk-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }} aria-hidden>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} style={rowStyle}>
              <td style={cell("14%")}>
                <div style={bar} />
              </td>
              <td style={cell("12%")}>
                <div style={bar} />
              </td>
              <td style={cell("12%")}>
                <div style={bar} />
              </td>
              <td style={cell("10%")}>
                <div style={bar} />
              </td>
              <td style={cell("8%")}>
                <div style={bar} />
              </td>
              <td style={cell("10%")}>
                <div style={bar} />
              </td>
              <td style={cell("18%")}>
                <div style={bar} />
              </td>
              <td style={cell("10%")}>
                <div style={bar} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function AppraisalsClient() {
  const router = useRouter();
  const { token, role, loading } = useAuth();
  const [newPublicAppraisalId, setNewPublicAppraisalId] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const firstFetchDoneRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(new Set());

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
    refetchInterval: 15_000,
  });

  const items = data?.items ?? [];
  const errMsg = error instanceof Error ? error.message : error ? "We couldn’t load appraisals. Check your connection and try again." : null;

  useEffect(() => {
    if (!token || !isFetched) return;
    const seen = seenIdsRef.current;
    const stored = loadSeenFromStorage();

    if (!firstFetchDoneRef.current) {
      firstFetchDoneRef.current = true;
      if (stored.size === 0) {
        for (const a of items) seen.add(a.id);
        saveSeenToStorage(seen);
        return;
      }
      for (const id of stored) seen.add(id);
    }

    for (const a of items) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        if (isPublicQuickAppraisal(a)) {
          setNewPublicAppraisalId(a.id);
        }
      }
    }
  }, [items, isFetched, token]);

  const dismissBanner = () => {
    setNewPublicAppraisalId(null);
    for (const a of items) seenIdsRef.current.add(a.id);
    saveSeenToStorage(seenIdsRef.current);
  };

  const onRowNavigate = (id: string) => {
    router.push(`/appraisals/${id}`);
  };

  const onCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(brandedAppraisalUrl);
      setCopyFeedback("Link copied to clipboard.");
      window.setTimeout(() => setCopyFeedback(null), 2500);
    } catch {
      setCopyFeedback("Could not copy — select the link manually.");
      window.setTimeout(() => setCopyFeedback(null), 3500);
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
      <main style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ color: "var(--text-primary)", margin: 0 }}>Deal desk — appraisals</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.35rem" }}>
            Rows load via <code style={{ fontSize: "0.82rem" }}>GET /dealer/appraisals</code> — the API resolves your tenant from the JWT and runs queries on the tenant-scoped Prisma client (AsyncLocalStorage), so listings cannot cross tenants.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
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
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <Link
            href="/appraisals/new"
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

      {newPublicAppraisalId && (
        <div
          role="status"
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
          <p style={{ margin: 0, color: "#7fffd4" }}>
            New public appraisal received —{" "}
            <Link href={`/appraisals/${newPublicAppraisalId}`} style={{ color: "#7fffd4", fontWeight: 700, textDecoration: "underline" }}>
              open detail
            </Link>
          </p>
          <button
            type="button"
            onClick={dismissBanner}
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
          <button type="button" onClick={() => void refetch()} style={{ marginTop: "0.5rem", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      )}

      {isLoading && !data && <ShimmerTable />}

      {!isLoading || data ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                <th style={{ padding: "0.5rem" }}>Appraisal ID</th>
                <th style={{ padding: "0.5rem" }}>Submission date</th>
                <th style={{ padding: "0.5rem" }}>Source</th>
                <th style={{ padding: "0.5rem" }}>VIN</th>
                <th style={{ padding: "0.5rem" }}>Mileage</th>
                <th style={{ padding: "0.5rem" }}>Condition</th>
                <th style={{ padding: "0.5rem" }}>Notes</th>
                <th style={{ padding: "0.5rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(({ a, pub, pl }) => {
                const cond = pub?.condition ?? null;
                const notesFull = fullNotesText(a);
                const preview = notesPreview80(a);
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
                    role="link"
                    tabIndex={0}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer",
                    }}
                  >
                    <td style={{ padding: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowNavigate(a.id);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          fontFamily: "ui-monospace, monospace",
                          fontSize: "0.8rem",
                          color: "var(--accent)",
                          cursor: "pointer",
                          textDecoration: "underline",
                          textAlign: "left",
                        }}
                        title={a.id}
                      >
                        {a.id.slice(0, 10)}…
                      </button>
                    </td>
                    <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }} title={new Date(a.createdAt).toLocaleString()}>
                      {relativeTime(a.createdAt)}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      {pub ? (
                        <span
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
                      {cond ? <span style={conditionBadgeStyle(cond)}>{cond}</span> : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td style={{ padding: "0.5rem", maxWidth: 220, color: "var(--text-muted)" }} title={notesFull || undefined}>
                      {preview}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <span style={pipelineBadgeStyle(pl)}>{pl}</span>
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
                Invite first customer
              </button>
              {copyFeedback && <p style={{ marginTop: "0.75rem", color: "#7fffd4", fontSize: "0.88rem" }}>{copyFeedback}</p>}
              <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)", wordBreak: "break-all" }}>{brandedAppraisalUrl}</p>
            </div>
          )}
        </div>
      ) : null}
    </main>
  );
}
