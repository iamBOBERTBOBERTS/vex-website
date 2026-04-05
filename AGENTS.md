# Vex — Coding Agent Execution Guide (Unison)

## Vision

Build a best-in-class **B2B SaaS platform for auto dealers** (CRM + Inventory + Customer Portal + Appraisals).

## Single Workspace Rule

- Use `PROJECT_SPACE.md` as the live execution hub.
- Keep sprint status and must-ship checklist updated there first.
- **Elite marketing / WebGL north star (perf budget, luxury UX matrix §21+):** `docs/plans/2026-04-04-vex-ELITE-DIGITAL-PRESENCE-v1.md` — **Crown Jewel v2.0 (wireframes, paths, Quantum tier):** `docs/plans/2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.0.md` — short checklist: `docs/plans/2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.md` — **Apex Studio `/build`:** `docs/plans/2026-04-05-vex-apex-studio-configurator-v1.0.md`

## Repo Structure

- `apps/web`: marketing + auth + pricing/checkout entrypoints
- `apps/api`: Express REST API + Prisma + Postgres
- `apps/crm`: dealer/customer portal (Next.js)
- `packages/shared`: shared types/schemas/utils

## Standards (non-negotiable)

- **Multi-tenant isolation on every API route** (no cross-tenant reads/writes).
- **RBAC on every route** (at minimum: `CUSTOMER | STAFF | ADMIN`).
- **Before any commit**: `pnpm -w turbo run build` must pass.
- **After substantive edits**: commit and push with `pnpm run git:save -- "type: short message"` (or `pnpm run git:save:verify -- "…"` to run build first). Set `GIT_AUTHOR_EMAIL` / `GIT_AUTHOR_NAME` if `user.email` / `user.name` are unset.
- **API/shared TypeScript**: keep types safe in shared/core; allow looser typing in route/controller edges only when necessary.
- **Stripe/webhooks**: verify signatures, keep handlers idempotent, never trust client-provided prices.

## Phase 1 (Now) — Execution Checklist

- Ensure `apps/api/tsconfig.json` is loose enough to unblock shipping (`skipLibCheck`, `strict: false`, `noImplicitAny: false`).
- Stripe subscriptions:
  - API route to create Stripe Checkout Session
  - API Stripe webhook route that verifies signature and is idempotent
  - Persist Stripe IDs in Prisma (`customer`, `subscription`, `checkoutSession`)
- Tenant foundation:
  - Prisma tenant model + user→tenant mapping
  - Tenant scoping middleware/helper used by all routes
  - Use AsyncLocalStorage-backed Prisma middleware to auto-scope `findMany/findFirst/count/aggregate` and auto-attach tenant on creates
  - Do not use unsafe unique actions (`findUnique/update/delete/upsert`) on the tenant-scoped Prisma client; prefer `findFirst/updateMany/deleteMany`

## Phase 2

- Inventory + CRM CRUD APIs (tenant scoped)
- `apps/crm` portal: vehicles + orders + invoices views
- Feature flags (simple Prisma-backed flags is acceptable)

## Phase 3

- Pricing tiers + Billing Portal
- White-label domains (tenant theming + domain mapping)
- Analytics dashboard

## Phase 4 — Appraisals + launch readiness

- **Prisma `Appraisal`**: `vehicleId`, `customerId`, `value`, `notes`, `status` (default `pending`), relations to `Vehicle` / `Customer`; `Tenant.onboardedAt` for first-login wizard.
- **API**: `GET/POST/PUT/DELETE /appraisals` — **STAFF | ADMIN** only, tenant-scoped Prisma, responses `{ data, error }` where applicable.
- **Public trade-in** (no auth): `POST /public/quick-appraisal`, `GET /public/quick-appraisal/:id` — resolve tenant via `?tenantId=`, `Host` → `customDomain`, or `PUBLIC_APPRAISAL_TENANT_ID`.
- **Valuation**: `apps/api/src/lib/appraisalValuation.ts` — replace with external API using env `VALUATION_`* when ready.
- **CRM**: `/appraisals` list, `/appraisals/new`, `/appraisals/[id]` with shared Zod + `react-hook-form`; PDF via `@react-pdf/renderer` (`AppraisalPdfButton`).
- **Onboarding**: `POST /auth/onboarding/complete` sets `Tenant.onboardedAt`; wizard surfaces in CRM + web portal until dismissed.
- **Health**: `GET /health` includes DB ping (`db: ok|error`).
- **E2E**: `pnpm --filter @vex/api run test:e2e` — appraisal + inventory isolation (SQL + scoped `findFirst`); `test:e2e:appraisal` / `test:e2e:inventory` run subsets.

## Required Verification Commands

- Build: `pnpm -w turbo run build`
- **Ordered pilot process:** `docs/PILOT_SHIP.md` (branch protection, migrate, deploy, then runtime verify)
- **Ship bar (local mirror of CI):** `pnpm run ship:gate` with `DATABASE_URL` set — runs `db:generate`, `turbo build`, `prisma migrate deploy`, `test:e2e` (see `scripts/ship-gate.sh`). Do not confuse with `release:pilot-check` (build + E2E only, no migrate).
- **Dealer-ready (deployed API):** `PILOT_VERIFY_API_URL=https://… pnpm run pilot:verify`
- **External gap docs:** if a memo claims “no Stripe / no tenant layer,” see `docs/ENGINEERING_REALITY.md` and verify the tree before re-scoping work.
- API only: `pnpm --filter @vex/api run build`
- Web only: `pnpm --filter @vex/web run build`
- CRM only: `pnpm --filter @vex/crm run build`

## Phase 4.5 — Valuation API integration

- Add `ValuationService` with Edmunds primary, MarketCheck fallback, and formula fallback.
- Add `POST /appraisals/valuate` (STAFF|ADMIN, tenant-scoped), caching via `ValuationCache` (24h TTL).
- Enforce daily cost cap (`$5/day`) and sanitize VIN/API logs.
- Store `valuationData`, `valuationSource`, `valuationFetchedAt` on `Appraisal`.
- Verification: `pnpm --filter @vex/api run test:valuation:unit` and `test:valuation:integration`.

## Billion-scale platform (sharding, queues, observability)

- **Tenant partition key**: every domain model includes `tenantId`; hot tables (`valuation_cache`, `event_logs`) are partition-ready via ops SQL in `apps/api/prisma/sql/`.
- **Prisma Accelerate / pooling**: `DATABASE_URL` + optional `DIRECT_DATABASE_URL`; comma `READ_REPLICA_URLS` for future read routing.
- **Queues**: BullMQ + Redis (`apps/api/src/lib/queue.ts`) — jobs `appraisal-pdf-generate`, `valuation-cache-warm`, `stripe-sync`, `analytics-rollup`; idempotent, tenant-scoped, DLQ via BullMQ failed retention.
- **Cache**: Redis cache-aside (`apps/api/src/lib/cache.ts`) for branding/themes; valuation TTL still backed by `ValuationCache` in Postgres.
- **Auth**: short-lived access JWT (default 5m) + refresh in Redis (or memory fallback); JWT denylist on logout.
- **Rate limits**: per-tenant / per-IP sliding window (`RATE_LIMIT_POINTS_PER_TENANT` / `RATE_LIMIT_WINDOW_SEC`).
- **Observability**: Prometheus `GET /metrics`, OpenTelemetry API hooks (`observability.ts`), valuation audit rows in `EventLog` with VIN **hash** only.
- **Frontends**: React Query v5 + lazy-loaded CRM appraisals module; PWA manifests; CRM edge CSS hook at `/edge-theme.css`.
- **Verification**: `pnpm -w turbo run build`, `pnpm --filter @vex/api run test:e2e`, `pnpm --filter @vex/api run load-test:scale`.

## Go-to-market launch + revenue pipeline

- **Onboarding SLA**: self-serve onboarding must complete in <90 seconds and be idempotent (safe retry on any step).
- **Provisioning**: paid checkout triggers async tenant provisioning with demo data and audit trail.
- **Revenue hooks**: referral generation/apply, usage logging for appraisal overages, owner dashboard metrics.
- **Compliance baseline**: immutable `AuditLog` entries on critical tenant CRUD paths; privacy policy route published.

## Phase 6 — AI + PWA + Growth

- **AI insights**: model outputs must include version; enforce per-tenant inference caps and fallback scoring.
- **PWA**: offline-first appraisal drafts with background sync queue behavior.
- **Growth**: referral/claim flows must be idempotent and audited.

## Phase 7 — Enterprise readiness

- **DMS integrations**: vendor syncs must be idempotent (`externalId + tenantId`) and audited.
- **Hierarchy**: support group/location structures with explicit override controls for `GROUP_ADMIN`.
- **Compliance**: SOC2-lite exports and immutable audit trail access controls.
- **Retention/expansion**: usage-driven offers and campaigns must be consent-aware and tenant-scoped.

## Phase 10 — Live launch + pilot MRR

- **Pilot onboarding**: paid-pilot flow must be idempotent; queue-based provisioning and audit logs required.
- **Revenue telemetry**: Stripe lifecycle events should persist usage/revenue logs for MRR reporting.
- **MRR visibility**: owner/admin dashboard exposes real-time-ish MRR + usage aggregates.
- **Customer success loop**: pilot feedback + nudge sequences must be async, consent-aware, and audited.

## Phase 11 — Post-launch acceleration + Series A

- **Iteration loop**: pilot usage must feed an auditable iteration backlog with prioritized actions.
- **Upsell automation**: usage events and offers must be server-signed, idempotent, and margin-aware.
- **Pilot-scale telemetry**: customer success signals should be captured without blocking critical API paths.
- **Capital package**: expose investor-facing KPI pages with access controls and auditability.

## Phase 13 — Hypergrowth engine

- **Marketing automation**: multi-channel campaign runs must be tenant-scoped, consent-aware, and fully audited.
- **Strategic partnerships**: partner lead intake and payouts must be idempotent, capped, and margin-guarded.
- **Scaling dashboard**: show MRR trajectory and partner spend with GROUP_ADMIN-only access.
- **Series A closing**: live data-room + term-sheet simulation endpoints require secure role checks and access logs.

## Phase 14 — Global unicorn OS

- **Global markets**: enforce tenant primary/supported regions with strict residency controls and auditable overrides.
- **Autonomous OS v2**: workflow orchestration and decision logs must be sandboxed, capped, and recoverable.
- **Predictive BI**: forecasting APIs must be role-restricted and derived from tenant-safe aggregates.
- **Capital/governance**: investor v2 live room, board packs, and equity controls must be auditable and access-controlled.

## Phase 15 — Scale + pre-IPO + exit

- **Multi-entity accounting**: consolidated ledger and reporting must be tenant-scoped with immutable audit trails.
- **Institutional governance**: board resolutions, equity actions, and 409A-adjacent workflows require strict RBAC and logs.
- **Liquidity modeling**: acquisition/IPO scenario APIs should remain deterministic, exportable, and access-controlled.
- **Enterprise security**: SSO/SCIM flows must be explicit and isolated without weakening normal auth guarantees.