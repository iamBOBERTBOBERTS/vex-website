# Pilot ship runbook (execute in order)

Treat this file as the **ordered** path from clone → **“we can put a dealer on this.”**  
**Builds alone are not enough.** After the API is deployed and reachable, **`pnpm pilot:verify`** (with `PILOT_VERIFY_API_URL`) is the automated line between “compiles” and “runtime is healthy enough for a pilot.”

---

## Step 0 — Branch protection (once per repo)

So `main` cannot move without the same bar CI enforces:

1. GitHub → **Settings** → **Branches** → **Add branch protection rule** (or edit existing).
2. **Branch name pattern:** `main`
3. Enable **Require a pull request before merging** (optional but recommended for teams).
4. Under **Require status checks to pass before merging**:
   - Click **Add checks**.
   - Search for **`ci`** or **`build-and-api-e2e`**.
   - Select the check whose label matches **`ci / build-and-api-e2e`** (workflow `ci.yml`, job `build-and-api-e2e`).
5. Save the rule.

If that check does not appear yet, open a PR to trigger `.github/workflows/ci.yml` once; then return and add the required check.

---

## Step 1 — Install and static proof (local or CI)

```bash
pnpm install --frozen-lockfile
pnpm --filter @vex/api run db:generate
pnpm -w turbo run build
```

On PRs, **Step 1** is enforced by CI after merge prerequisites; locally, run the above before any deploy.

---

## Step 2 — Database and schema (target environment)

1. **Backup** production/pilot Postgres if it already has data.
2. Point `DATABASE_URL` / `DIRECT_DATABASE_URL` at that database (see `apps/api/.env.example`).
3. Apply schema:

```bash
cd apps/api && pnpm exec prisma migrate deploy && cd ../..
```

---

## Step 3 — Full ship gate (tenant isolation + build)

Requires **Step 2** complete and `DATABASE_URL` set (same DB you will use for the API, or a clone):

```bash
pnpm run ship:gate
```

This runs: generate → full monorepo build → `migrate deploy` → `test:e2e` (appraisal + inventory tenant isolation).  
If this fails, do not point dealers at the environment.

---

## Step 4 — Deploy API

1. Configure production env: `NODE_ENV=production`, `JWT_SECRET`, `DATABASE_URL`, `REDIS_URL` (strongly recommended — without it, queues and Redis rate limits are off), `CORS_ORIGIN` (**comma-separated allowlist** — empty or `*` causes the API to **exit on startup**), Edmunds + MarketCheck keys (and **do not** set `SKIP_VALUATION_ENV_CHECK` in production — also causes exit), `PUBLIC_WEB_URL` for Stripe checkout/portal return URLs, Stripe secrets if you charge.
2. Start the API process (see [deploy/README.md](../deploy/README.md) if using Docker).
3. **Optional demo seed** (pilot sandboxes only): from `apps/api`, `pnpm exec prisma db seed` — seed footer prints `ship:gate` / `pilot:verify` reminders.
4. From your machine (or a bastion), **do not** skip Step 5.

---

## Step 5 — Automated runtime verify (dealer-ready line)

With the API **up** and TLS/DNS correct, set the public API origin (no trailing slash required):

```bash
export PILOT_VERIFY_API_URL="https://api.your-pilot-domain.com"
pnpm run pilot:verify
```

This asserts:

- `GET /health` returns **200**, `status` is **`ok`**, and `db` is **`ok`**.
- `GET /` returns a successful JSON payload from the API root.

Exit code **0** = runtime smoke passed. **Non-zero** = not dealer-ready (fix deploy, DB connectivity, or env before onboarding).

Optional:

- `PILOT_VERIFY_BRANDING_DOMAIN=dealer.example.com` — also checks `GET /public/branding?domain=...` returns **200** (use the pilot’s `customDomain` when testing white-label).

---

## Step 6 — Deploy web and CRM

Deploy `apps/web` and `apps/crm` with the **same** `NEXT_PUBLIC_API_URL` as the origin you used in Step 5.

For **live pilot network metrics** on `/investor` and `/investor-deck` (via `GET /api/investor/pilot-network` → `GET /dealer/pilots`), set **`INTERNAL_PILOT_METRICS_KEY` on both the API and `apps/web`** to the **same** secret (see `apps/api/.env.example` and `apps/web/.env.local.example`). Generate one with `openssl rand -hex 32`, keep it **server-only** on the web app, and send it only via the `x-internal-key` header.

---

## Step 7 — Human smoke (≈2 minutes)

1. CRM: sign in as staff/admin; open appraisals (list or one record).
2. Web: load inventory or appraisal entry flow if in scope for the pilot.
3. If white-label: confirm branding/trade-in per [pilot-white-label-dns.md](pilot-white-label-dns.md).

---

## Step 8 — Rollback posture

Keep the previous API revision/image and a **DB backup** before first pilot traffic. Prefer reverting traffic before attempting schema downgrades.

---

## Quick reference

| Milestone | Command / artifact |
|-----------|-------------------|
| Merge safety | Required check **`ci / build-and-api-e2e`** on `main` |
| Schema + tenant proof | `pnpm run ship:gate` |
| **Dealer-ready (API live)** | `PILOT_VERIFY_API_URL=… pnpm run pilot:verify` |

See also: [SHIP.md](SHIP.md) (overview), [ENGINEERING_REALITY.md](ENGINEERING_REALITY.md) (fact-check gap analyses), [pilot-white-label-dns.md](pilot-white-label-dns.md), [deploy/README.md](../deploy/README.md).
