#!/usr/bin/env node
/**
 * Runtime smoke for a deployed API. Set PILOT_VERIFY_API_URL to the API origin (e.g. https://api.example.com).
 * Optional: PILOT_VERIFY_BRANDING_DOMAIN=dealer.example.com to check /public/branding.
 * Optional: PILOT_VERIFY_INTERNAL_KEY=<same as API INTERNAL_PILOT_METRICS_KEY> to verify GET /dealer/pilots.
 *
 * If PILOT_VERIFY_API_URL is unset, exits 0 (skip) so CI / morning-gate stay green without a live deploy.
 * Set PILOT_VERIFY_STRICT=true to fail when the URL is missing (release pipelines).
 */
const base = (process.env.PILOT_VERIFY_API_URL ?? "").replace(/\/$/, "").trim();
const strict =
  process.env.PILOT_VERIFY_STRICT === "1" || process.env.PILOT_VERIFY_STRICT === "true";
const checkFortellis = process.argv.includes("--fortellis");
const checkTekion = process.argv.includes("--tekion");
const checkReynolds = process.argv.includes("--reynolds");
const checkDealertrack = process.argv.includes("--dealertrack");
const checkCdk = process.argv.includes("--cdk");
if (!base) {
  if (strict) {
    console.error(
      "pilot-verify: PILOT_VERIFY_STRICT is set but PILOT_VERIFY_API_URL is missing"
    );
    process.exit(1);
  }
  console.log(
    "pilot-verify: skipped (set PILOT_VERIFY_API_URL to verify a deployed API, e.g. https://api.dealer.com)"
  );
  process.exit(0);
}

/** Skip placeholder / RFC 2606 hosts so local pipelines do not fail DNS (e.g. your-api.example). */
try {
  const origin = base.startsWith("http") ? base : `https://${base}`;
  const host = new URL(origin).hostname.toLowerCase();
  const isPlaceholder =
    host.endsWith(".example") ||
    host === "example.com" ||
    /^your(-real)?-api\.example$/.test(host);
  if (isPlaceholder) {
    console.log(
      "pilot-verify: skipped (placeholder hostname; use a real deploy URL, or unset PILOT_VERIFY_API_URL)"
    );
    process.exit(0);
  }
} catch {
  console.error("pilot-verify: invalid PILOT_VERIFY_API_URL", base);
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

  /** Same value as API INTERNAL_PILOT_METRICS_KEY — optional smoke for GET /dealer/pilots */
  const pilotMetricsKey = (process.env.PILOT_VERIFY_INTERNAL_KEY ?? "").trim();
  if (pilotMetricsKey) {
    const mpRes = await fetch(`${base}/dealer/pilots`, {
      headers: { Accept: "application/json", "x-internal-key": pilotMetricsKey },
    });
    const mpText = await mpRes.text();
    let mpJson;
    try {
      mpJson = JSON.parse(mpText);
    } catch {
      console.error("pilot-verify: GET /dealer/pilots expected JSON:", mpText.slice(0, 300));
      process.exit(1);
    }
    if (!mpRes.ok) {
      console.error("pilot-verify: GET /dealer/pilots HTTP", mpRes.status, mpJson);
      process.exit(1);
    }
    const d = mpJson?.data;
    if (
      !d ||
      typeof d.activePilots !== "number" ||
      typeof d.totalPilotAppraisals !== "number" ||
      typeof d.firstBillingEvents !== "number"
    ) {
      console.error("pilot-verify: GET /dealer/pilots unexpected shape:", mpJson);
      process.exit(1);
    }
    console.log(
      "pilot-verify: GET /dealer/pilots OK",
      `(activePilots=${d.activePilots}, appraisals=${d.totalPilotAppraisals})`
    );
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

  if (checkFortellis) {
    const tokenUrl = process.env.FORTELLIS_TOKEN_URL;
    const clientId = process.env.FORTELLIS_CLIENT_ID;
    const clientSecret = process.env.FORTELLIS_CLIENT_SECRET;
    if (!tokenUrl || !clientId || !clientSecret) {
      console.error(
        "pilot-verify: --fortellis requested but missing FORTELLIS_TOKEN_URL / FORTELLIS_CLIENT_ID / FORTELLIS_CLIENT_SECRET"
      );
      process.exit(1);
    }
    const form = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const tokenText = await tokenRes.text();
    let tokenJson = {};
    try {
      tokenJson = JSON.parse(tokenText);
    } catch {
      // no-op
    }
    if (!tokenRes.ok || typeof tokenJson.access_token !== "string") {
      console.error("pilot-verify: fortellis token check failed", tokenRes.status, tokenJson);
      process.exit(1);
    }
    console.log("pilot-verify: fortellis token check OK");
  }

  if (checkTekion) {
    const tokenUrl = process.env.TEKION_TOKEN_URL;
    const clientId = process.env.TEKION_CLIENT_ID;
    const clientSecret = process.env.TEKION_CLIENT_SECRET;
    if (!tokenUrl || !clientId || !clientSecret) {
      console.error(
        "pilot-verify: --tekion requested but missing TEKION_TOKEN_URL / TEKION_CLIENT_ID / TEKION_CLIENT_SECRET"
      );
      process.exit(1);
    }
    const form = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const tokenText = await tokenRes.text();
    let tokenJson = {};
    try {
      tokenJson = JSON.parse(tokenText);
    } catch {
      // no-op
    }
    if (!tokenRes.ok || typeof tokenJson.access_token !== "string") {
      console.error("pilot-verify: tekion token check failed", tokenRes.status, tokenJson);
      process.exit(1);
    }
    console.log("pilot-verify: tekion token check OK");
  }

  if (checkReynolds) {
    const tokenUrl = process.env.REYNOLDS_TOKEN_URL;
    const clientId = process.env.REYNOLDS_CLIENT_ID;
    const clientSecret = process.env.REYNOLDS_CLIENT_SECRET;
    if (!tokenUrl || !clientId || !clientSecret) {
      console.error(
        "pilot-verify: --reynolds requested but missing REYNOLDS_TOKEN_URL / REYNOLDS_CLIENT_ID / REYNOLDS_CLIENT_SECRET"
      );
      process.exit(1);
    }
    const form = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const tokenText = await tokenRes.text();
    let tokenJson = {};
    try {
      tokenJson = JSON.parse(tokenText);
    } catch {
      // no-op
    }
    if (!tokenRes.ok || typeof tokenJson.access_token !== "string") {
      console.error("pilot-verify: reynolds token check failed", tokenRes.status, tokenJson);
      process.exit(1);
    }
    console.log("pilot-verify: reynolds token check OK");
  }

  if (checkDealertrack) {
    const tokenUrl = process.env.DEALERTRACK_TOKEN_URL;
    const clientId = process.env.DEALERTRACK_CLIENT_ID;
    const clientSecret = process.env.DEALERTRACK_CLIENT_SECRET;
    if (!tokenUrl || !clientId || !clientSecret) {
      console.error(
        "pilot-verify: --dealertrack requested but missing DEALERTRACK_TOKEN_URL / DEALERTRACK_CLIENT_ID / DEALERTRACK_CLIENT_SECRET"
      );
      process.exit(1);
    }
    const form = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const tokenText = await tokenRes.text();
    let tokenJson = {};
    try {
      tokenJson = JSON.parse(tokenText);
    } catch {
      // no-op
    }
    if (!tokenRes.ok || typeof tokenJson.access_token !== "string") {
      console.error("pilot-verify: dealertrack token check failed", tokenRes.status, tokenJson);
      process.exit(1);
    }
    console.log("pilot-verify: dealertrack token check OK");
  }

  if (checkCdk) {
    const tokenUrl = process.env.FORTELLIS_TOKEN_URL;
    const clientId = process.env.FORTELLIS_CLIENT_ID;
    const clientSecret = process.env.FORTELLIS_CLIENT_SECRET;
    if (!tokenUrl || !clientId || !clientSecret) {
      console.error(
        "pilot-verify: --cdk requested but missing FORTELLIS_TOKEN_URL / FORTELLIS_CLIENT_ID / FORTELLIS_CLIENT_SECRET"
      );
      process.exit(1);
    }
    const form = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const tokenText = await tokenRes.text();
    let tokenJson = {};
    try {
      tokenJson = JSON.parse(tokenText);
    } catch {
      // no-op
    }
    if (!tokenRes.ok || typeof tokenJson.access_token !== "string") {
      console.error("pilot-verify: cdk token check failed", tokenRes.status, tokenJson);
      process.exit(1);
    }
    console.log("pilot-verify: cdk token check OK");
  }
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
