#!/usr/bin/env node
/**
 * Runtime smoke for a deployed API. Set PILOT_VERIFY_API_URL to the API origin (e.g. https://api.example.com).
 * Optional: PILOT_VERIFY_BRANDING_DOMAIN=dealer.example.com to check /public/branding.
 */
const base = (process.env.PILOT_VERIFY_API_URL ?? "").replace(/\/$/, "");
if (!base) {
  console.error(
    "pilot-verify: set PILOT_VERIFY_API_URL to your deployed API base URL (e.g. https://api.dealer.com)"
  );
  process.exit(1);
}

async function assertOk(res, label) {
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error(`pilot-verify: ${label}: expected JSON, got:`, text.slice(0, 300));
    process.exit(1);
  }
  return { json, text };
}

async function main() {
  const healthUrl = `${base}/health`;
  const healthRes = await fetch(healthUrl, { headers: { Accept: "application/json" } });
  const { json: h } = await assertOk(healthRes, "GET /health");

  if (healthRes.status !== 200) {
    console.error("pilot-verify: GET /health HTTP", healthRes.status, h);
    process.exit(1);
  }
  if (h.status !== "ok" || h.db !== "ok") {
    console.error("pilot-verify: GET /health degraded:", h);
    process.exit(1);
  }

  const rootRes = await fetch(`${base}/`, { headers: { Accept: "application/json" } });
  const { json: r } = await assertOk(rootRes, "GET /");
  if (!rootRes.ok) {
    console.error("pilot-verify: GET / HTTP", rootRes.status, r);
    process.exit(1);
  }
  if (typeof r.api !== "string" || !r.api.includes("vex")) {
    console.error("pilot-verify: GET / unexpected payload (missing api:@vex marker):", r);
    process.exit(1);
  }

  const brandingDomain = process.env.PILOT_VERIFY_BRANDING_DOMAIN?.trim();
  if (brandingDomain) {
    const u = new URL("/public/branding", base);
    u.searchParams.set("domain", brandingDomain);
    const bRes = await fetch(u, { headers: { Accept: "application/json" } });
    const text = await bRes.text();
    let bj;
    try {
      bj = JSON.parse(text);
    } catch {
      console.error("pilot-verify: GET /public/branding not JSON:", text.slice(0, 300));
      process.exit(1);
    }
    if (!bRes.ok) {
      console.error("pilot-verify: GET /public/branding HTTP", bRes.status, bj);
      process.exit(1);
    }
    if (!bj || typeof bj !== "object" || !("data" in bj)) {
      console.error("pilot-verify: GET /public/branding unexpected shape:", bj);
      process.exit(1);
    }
  }

  console.log("pilot-verify: OK", healthUrl, "db=ok");
  if (brandingDomain) console.log("pilot-verify: branding check OK for domain", brandingDomain);
}

main().catch((e) => {
  const cause = e?.cause ?? e;
  if (cause?.code === "ECONNREFUSED") {
    console.error(
      "pilot-verify: cannot reach API (connection refused). Is the server up and is PILOT_VERIFY_API_URL correct?",
      String(process.env.PILOT_VERIFY_API_URL)
    );
    process.exit(1);
  }
  console.error("pilot-verify:", e);
  process.exit(1);
});
