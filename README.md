# VEX — Vortex Exotic Exchange

Luxury automotive marketplace: customer-facing site, build-your-own configurator, CRM, and full deal flow (inventory, financing, shipping, trade-in).

## Start Here

- **Project command center:** [PROJECT_SPACE.md](PROJECT_SPACE.md)

## Docs

- **Design:** [docs/plans/2025-03-15-vex-luxury-marketplace-design.md](docs/plans/2025-03-15-vex-luxury-marketplace-design.md)
- **Implementation plan:** [docs/plans/2025-03-15-vex-luxury-marketplace-implementation.md](docs/plans/2025-03-15-vex-luxury-marketplace-implementation.md)
- **Leads (SMS/email → CRM):** [docs/leads-webhooks.md](docs/leads-webhooks.md)
- **Pilot white-label (custom domain, DNS):** [docs/pilot-white-label-dns.md](docs/pilot-white-label-dns.md)
- **Shipping a pilot (overview):** [docs/SHIP.md](docs/SHIP.md)
- **Pilot ship runbook (ordered steps + branch protection):** [docs/PILOT_SHIP.md](docs/PILOT_SHIP.md)
- **What’s already built vs. common gap myths:** [docs/ENGINEERING_REALITY.md](docs/ENGINEERING_REALITY.md)
- **Tenant isolation + RBAC notes:** [docs/TENANT_RBAC.md](docs/TENANT_RBAC.md)

## Repo structure

- **apps/api** — Node/Express API (auth, inventory, orders, etc.)
- **apps/web** — Next.js customer site (dark luxury theme)
- **apps/crm** — Next.js CRM for staff
- **packages/shared** — Shared TypeScript types and Zod schemas
- **packages/ui** — Shared UI primitives for web + CRM (`@vex/ui`)

## Fresh clone: full build verification

After `pnpm install`, generate the Prisma client (required for `apps/api` TypeScript) and build everything:

```bash
pnpm install
pnpm --filter @vex/api run db:generate
pnpm -w turbo run build
```

If you add or change workspace packages, run `pnpm install` again so `pnpm-lock.yaml` stays in sync (CI may use a frozen lockfile).

## Prerequisites

- Node 20+
- pnpm (install globally: `npm install -g pnpm`, or use `npx pnpm` for every command)
- PostgreSQL (for API)

## Setup

1. **Install dependencies**

   If `pnpm` is not in your PATH, use `npx pnpm`:

   ```bash
   npx pnpm install
   ```

   Or after installing pnpm globally (`npm install -g pnpm`):

   ```bash
   pnpm install
   ```

2. **API**

   - Copy `apps/api/.env.example` to `apps/api/.env` and set `DATABASE_URL` and `JWT_SECRET`.
   - Run migrations: `cd apps/api && npx prisma migrate deploy` (or `migrate dev` for a fresh DB).
   - Seed the database (admin user, sample vehicles, inventory): `cd apps/api && npx pnpm run db:seed` or `npx prisma db seed`.
   - Start API: `pnpm dev:api` (or `cd apps/api && npx tsx src/index.ts`)

3. **Shared package** (required before API or apps that use it)

   ```bash
   pnpm --filter @vex/shared build
   ```

4. **Customer site (web)**

   - Optional: add the VEX logo (no background) as `apps/web/public/vex-logo.png` for the header.
   - Start: `pnpm dev:web` → [http://localhost:3000](http://localhost:3000)

5. **CRM** (staff only)

   - Set `NEXT_PUBLIC_API_URL` (and optionally `NEXT_PUBLIC_WEB_URL` for “View on site” links).
   - After seeding, sign in with **admin@vex.demo** or **staff@vex.demo** (password: `admin-vex-demo` — change in production).
   - Start: `pnpm dev:crm` → [http://localhost:3002](http://localhost:3002)

## Environment variables

| App   | Variable              | Description                    |
|-------|------------------------|--------------------------------|
| API   | `DATABASE_URL`         | PostgreSQL connection string (pooler or Accelerate) |
| API   | `DIRECT_DATABASE_URL`  | Direct Postgres URL for migrations / long scripts |
| API   | `REDIS_URL`              | Redis for BullMQ, cache, refresh tokens, rate limits |
| API   | `JWT_SECRET`           | Secret for signing JWTs         |
| API   | `PORT`                 | Server port (default 3001)      |
| API   | `CORS_ORIGIN`          | Allowed origin (e.g. http://localhost:3000) |
| Web   | `NEXT_PUBLIC_API_URL`  | API base URL (e.g. http://localhost:3001)   |
| Web   | `INTERNAL_PILOT_METRICS_KEY` | Same value as API — enables `/api/investor/pilot-network` (server proxy to `GET /dealer/pilots`). Optional locally; set in staging/prod for live pilot counters on `/investor` and `/investor-deck`. |
| Web   | `INTERNAL_API_URL` | Optional server-only API origin for that proxy (defaults to `NEXT_PUBLIC_API_URL`). |
| Web   | `NEXT_PUBLIC_SITE_URL` | Public site origin for metadata / Open Graph (e.g. https://your-domain.com). Falls back to `VERCEL_URL` on Vercel, else `http://localhost:3000`. |
| Web   | `NEXT_PUBLIC_HERO_VIDEO_URL` | Optional: looped hero background video URL (muted). Omit for gradient + 3D only. |
| Web   | `NEXT_PUBLIC_HERO_VIDEO_POSTER` | Optional: poster image for hero video. |
| CRM   | `NEXT_PUBLIC_API_URL`  | API base URL (same host as web in production). |
| CRM   | `NEXT_PUBLIC_WEB_URL`  | Customer site URL (for “View on site” links). |
| Ops   | `PILOT_VERIFY_API_URL`  | Deployed API origin for `pnpm run pilot:verify` ([docs/PILOT_SHIP.md](docs/PILOT_SHIP.md)). |
| Ops   | `PILOT_VERIFY_BRANDING_DOMAIN` | Optional: pilot `customDomain` to assert `GET /public/branding`. |

## Production deployment

- **API (Docker-first):** See [deploy/docker-compose.yml](deploy/docker-compose.yml), [deploy/.env.example](deploy/.env.example), and [deploy/README.md](deploy/README.md). With `NODE_ENV=production`, the process **exits on boot** if `CORS_ORIGIN` is empty or `*`, if `SKIP_VALUATION_ENV_CHECK` is set, or if valuation keys are missing — by design. Set `JWT_SECRET`, `REDIS_URL` (recommended), `PUBLIC_WEB_URL` (Stripe return URLs), and Stripe secrets if billing is live.
- **Next.js (web + CRM):** Run `apps/web` and `apps/crm` on a second platform (Vercel, Fly.io, Railway, etc.) with the **same** `NEXT_PUBLIC_API_URL` pointing at the API origin. Compose in this repo targets the API and backing services by design.
- **Pilot white-label (custom domain → tenant):** [docs/pilot-white-label-dns.md](docs/pilot-white-label-dns.md)
- **Full pilot checklist (ordered):** [docs/PILOT_SHIP.md](docs/PILOT_SHIP.md). After the API is live, `PILOT_VERIFY_API_URL=… pnpm run pilot:verify` is the line between “builds” and “dealer-ready.”

## Pilot release gate

Follow [docs/PILOT_SHIP.md](docs/PILOT_SHIP.md) end-to-end. Quick compile + DB isolation check:

```bash
pnpm -w turbo run build && pnpm --filter @vex/api run test:e2e
```

Or: `pnpm run release:pilot-check` (same commands). E2E needs a reachable Postgres (`DATABASE_URL`). For the **deployed** API, run `pnpm run pilot:verify` with `PILOT_VERIFY_API_URL` set.

## Quality gates

| Gate | What it proves |
|------|----------------|
| **GitHub: `ci / build-and-api-e2e`** (workflow `ci.yml`) | Postgres + migrate + full `turbo` build + tenant isolation E2E on every PR / `main` push. Set branch protection to **require** this check. |
| **`pnpm run ship:gate`** | Same sequence locally: `db:generate` → build → `migrate deploy` → `test:e2e` (appraisal + inventory isolation; needs `DATABASE_URL`). Not the same as `release:pilot-check` (build + E2E, no migrate). |
| **`pnpm run pilot:verify`** | Deployed API is reachable and healthy (`PILOT_VERIFY_API_URL`). Dealer-ready line — see [docs/PILOT_SHIP.md](docs/PILOT_SHIP.md). |

## Scripts (from repo root)

Use `pnpm` or `npx pnpm` if pnpm isn’t installed globally:

| Command | Description |
|---------|--------------|
| `pnpm dev:api` or `npx pnpm run dev:api` | Start API on port 3001 |
| `pnpm dev:web` or `npx pnpm run dev:web` | Start customer site on 3000 |
| `pnpm dev:crm` or `npx pnpm run dev:crm` | Start CRM on 3002 |
| `pnpm build` or `npx pnpm run build` | Build all packages |
| `pnpm run release:pilot-check` | Turbo build + appraisal E2E (needs `DATABASE_URL`) |
| `pnpm run ship:gate` | Generate + build + migrate + appraisal E2E — same bar as CI ([docs/PILOT_SHIP.md](docs/PILOT_SHIP.md)) |
| `pnpm run pilot:verify` | After API is deployed: set `PILOT_VERIFY_API_URL`, then run ([docs/PILOT_SHIP.md](docs/PILOT_SHIP.md) Step 5) |
| `pnpm run git:save -- "type: message"` | Stage all, commit, push current branch (default message if omitted). Use `GIT_SAVE_MSG` or pass a message after `--`. |
| `pnpm run git:save:verify -- "type: message"` | Run `pnpm -w turbo run build`, then same as `git:save` (recommended before sharing). |
| `cd apps/api && pnpm run db:seed` or `npx prisma db seed` | Seed DB (admin, vehicles, inventory) |

## Logo

Place your **VEX logo (no background)** at `apps/web/public/vex-logo.png`. The header will use it; if the file is missing, the text “VEX” is shown as fallback.


## Valuation API cost model
- Pro/Enterprise tiers include API-powered appraisals.
- Daily guardrail: max `$5/day` external valuation spend per tenant before fallback/manual flow.
- Cached valuations (24h TTL) reduce duplicate API calls and cost.

## Billion-scale operations (targets)
- **Cost / MRR**: target **~$0.02/tenant/month** at 100k tenants via PgBouncer/Accelerate-style pooling, Redis cache-aside, BullMQ async work, and read replicas (`READ_REPLICA_URLS` for future read routing).
- **Infra**: `DIRECT_DATABASE_URL` for migrations when `DATABASE_URL` uses a pooler or Prisma Accelerate; `REDIS_URL` for queues, refresh tokens, JWT denylist, and rate limits; optional `OTEL_EXPORTER_OTLP_ENDPOINT` for traces.
- **Partitioning / cron**: declarative Postgres partitions and `pg_cron` retention are documented in `apps/api/prisma/sql/` (ops-applied).
- **Verification**: `pnpm --filter @vex/api run test:e2e`, `pnpm --filter @vex/api run load-test:scale`, `GET /metrics` (Prometheus).

## Investor sharing links
- Live MRR dashboard URL: `https://app.vex.example/admin` (replace with your production domain).
- Pilot signup link: `https://app.vex.example/pilot` (replace with your production domain).
- Live seed metrics dashboard URL: `https://app.vex.example/seed-metrics` (replace with your production domain).
- Enterprise pilot signup link: `https://app.vex.example/pilot?segment=enterprise` (replace with your production domain).
- Live SOC2 status: `https://app.vex.example/compliance/soc2-report` (replace with your production domain).
- Live MRR dashboard URL: `https://app.vex.example/admin/mrr` (replace with your production domain).
- Secure investor data-room URL: `https://app.vex.example/capital` (replace with your production domain).
- Scaling dashboard URL: `https://app.vex.example/scaling` (replace with your production domain).
- Secure investor CRM URL: `https://app.vex.example/raise/series-a` (replace with your production domain).
- Forecasting suite URL: `https://app.vex.example/forecasting` (replace with your production domain).
- Autonomous operations dashboard URL: `https://crm.vex.example/autonomous` (replace with your production domain).
- Exit readiness dashboard URL: `https://app.vex.example/raise/exit` (replace with your production domain).
