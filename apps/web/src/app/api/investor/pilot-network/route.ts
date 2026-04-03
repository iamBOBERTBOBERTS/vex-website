import { NextResponse } from "next/server";

/** Server-side proxy to GET /dealer/pilots (internal key). Used by /investor-deck and /investor for live pilot traction metrics. */
export async function GET() {
  const key = process.env.INTERNAL_PILOT_METRICS_KEY;
  const api =
    process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  if (!key) {
    return NextResponse.json({ code: "NOT_CONFIGURED", message: "INTERNAL_PILOT_METRICS_KEY not set on web app" }, { status: 503 });
  }
  const r = await fetch(`${api.replace(/\/$/, "")}/dealer/pilots`, {
    headers: { "x-internal-key": key },
    cache: "no-store",
  });
  const body = await r.json().catch(() => ({}));
  return NextResponse.json(body, { status: r.status });
}
