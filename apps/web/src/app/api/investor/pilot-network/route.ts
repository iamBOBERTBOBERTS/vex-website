import { NextResponse } from "next/server";

const UPSTREAM_MS = 12_000;

/** Server-side proxy to GET /dealer/pilots (internal key). Used by /investor-deck and /investor for live pilot traction metrics. */
export async function GET() {
  const key = process.env.INTERNAL_PILOT_METRICS_KEY;
  const api =
    process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  if (!key) {
    return NextResponse.json(
      { code: "NOT_CONFIGURED", message: "INTERNAL_PILOT_METRICS_KEY not set on web app" },
      { status: 503 }
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_MS);
  try {
    const r = await fetch(`${api.replace(/\/$/, "")}/dealer/pilots`, {
      headers: { "x-internal-key": key },
      cache: "no-store",
      signal: controller.signal,
    });
    const body = await r.json().catch(() => ({}));
    return NextResponse.json(body, { status: r.status });
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return NextResponse.json(
      {
        code: aborted ? "TIMEOUT" : "UPSTREAM_UNREACHABLE",
        message: aborted
          ? `Pilot metrics request timed out after ${UPSTREAM_MS / 1000}s`
          : "Could not reach the API for pilot metrics (check INTERNAL_API_URL / NEXT_PUBLIC_API_URL)",
      },
      { status: aborted ? 504 : 502 }
    );
  } finally {
    clearTimeout(timer);
  }
}
