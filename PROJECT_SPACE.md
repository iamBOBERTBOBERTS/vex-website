# VEX Project Space (Single Operating Hub)

Use this file as the primary command center for execution.

## Current Focus

- Ship dealer-facing revenue path in a tight loop.
- Keep tenant isolation + RBAC + Stripe idempotency non-negotiable.
- Convert pilots to paid usage, not feature sprawl.
- Execute competitive plan: `docs/VEX_COMPETITIVE_EXECUTION_PLAN_2026-04-02.md`.

## 14-Day Beachhead Sprint

### Must Ship

- Multi-tenant enforcement audit complete on all API routes.
- Stripe checkout + webhook + billing portal verified in staging.
- Inventory/orders/appraisals dealer flows stable end-to-end.
- Pilot verification pass on deployed API (`pnpm run pilot:verify`).

### Go-To-Market

- Line up 3-5 luxury/exotic dealer pilot candidates.
- Demo script: private liquidity + public configurator.
- Pricing test: pay-per-deal-closed + usage overages.

## Source Of Truth Map

- Execution guardrails: `AGENTS.md`
- Delivery runbook: `docs/PILOT_SHIP.md`
- Ship gate details: `docs/SHIP.md`
- Tenant/RBAC details: `docs/TENANT_RBAC.md`
- Reality check memo: `docs/ENGINEERING_REALITY.md`
- Competitive execution system: `docs/VEX_COMPETITIVE_EXECUTION_PLAN_2026-04-02.md`
- **Digital presence v2 (elite luxury framework):** `docs/plans/2026-04-05-vex-DIGITAL-PRESENCE-v2-ELITE.md`
- **Elite digital presence v2.0 (Crown Jewel Protocol — full spec):** `docs/plans/2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.0.md`
- **Elite v2 summary checklist:** `docs/plans/2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.md`
- **Apex Studio `/build` (v2.1):** `docs/plans/2026-04-05-vex-apex-studio-configurator-v1.0.md`
- **Elite digital presence v1 (WebGL gate + §21+):** `docs/plans/2026-04-04-vex-ELITE-DIGITAL-PRESENCE-v1.md`

## Standard Commands

- Install: `pnpm install`
- Build all: `pnpm -w turbo run build`
- API E2E isolation: `pnpm --filter @vex/api run test:e2e`
- CI mirror: `pnpm run ship:gate`
- Deployed readiness: `PILOT_VERIFY_API_URL=https://... pnpm run pilot:verify`

## Workspace Organization Rules

- Start execution from this file first.
- Treat this file as the live sprint board and update checkboxes as work lands.
- Add new docs only if they are linked from this hub.
- Keep generated or local-only files out of git where possible.

## Daily Execution Cadence

- Morning: run `pnpm -w turbo run build` and `pnpm --filter @vex/api run test:e2e`.
- Before any pilot-facing release: run `pnpm run ship:gate`.
- After deploy: run `PILOT_VERIFY_API_URL=... pnpm run pilot:verify`.
- End of day: update KPI and checklist progress in the competitive execution plan.

## Day 1 Execution Checklist

- Run gate commands in order (log 2026-04-03, this workspace):
  - `pnpm -w turbo run build` — green (all 5 packages).
  - `pnpm --filter @vex/api run test:e2e` — green after E2E scripts use `systemPrisma` + scoped `prisma` from `lib/tenant.ts` (raw `PrismaClient()` had no `$use` tenant merge).
  - `DATABASE_URL=postgresql://vex:vex@127.0.0.1:5432/vex DIRECT_DATABASE_URL=postgresql://vex:vex@127.0.0.1:5432/vex pnpm run ship:gate` — green after Prisma migration ledger recovery (`migrate resolve`) and clean `migrate status`.
  - `PILOT_VERIFY_API_URL=http://127.0.0.1:3001 pnpm run pilot:verify` — green (`pilot-verify: OK ... db=ok`).
- If any command is red, fix gate blockers before feature work.
- Trust layer (Roadmap v3.0 — Days 1–3) — **verified in repo**:
  - ALS + scoped `prisma`: `apps/api/src/lib/tenant.ts` (`$use` merges `tenantId`, blocks `findUnique` / single-row `update|delete|upsert` on tenant models).
  - HTTP → ALS bridge: `apps/api/src/middleware/tenantScope.ts` (`withTenantRequestContext`) + `apps/api/src/middleware/tenant.ts` (JWT tenant, blocks body/query `tenantId` spoofing).
  - RBAC: `apps/api/src/middleware/rbac.ts` + `requireRole.ts` (global `rbacAnyAuthenticated` after tenant; stricter `requireRole` on dealer/admin routes per `docs/TENANT_RBAC.md`).
  - E2E: `scripts/e2e-trust-layer-prisma.ts` (ALS + Prisma enforcement) + appraisal/inventory isolation + RBAC guard scripts — run via `pnpm --filter @vex/api run test:e2e`.
- Pass/Fail target: `pnpm --filter @vex/api run test:e2e` green with zero cross-tenant leakage.
- Pilot outreach: send one-line offer to 3 Cavin contacts and log status in this file.

## Realtime Scaling Sprint (Kickoff)

- Add API WebSocket runtime at `WS /ws/auctions?token=<jwt>` with JWT tenant auth.
- Add Redis Streams fan-out foundation for cross-instance room broadcasts (`vex:auction:{tenant}:{room}:events`).
- Add 15s heartbeat/ping-pong and stale-connection termination.
- Add premium-first broadcast ordering (STAFF/ADMIN/GROUP_ADMIN before CUSTOMER).
- Add Prometheus telemetry: `vex_ws_active_connections`, `vex_auction_broadcast_latency_ms`, `vex_ws_messages_total`.
- Run horizontal proof with 2+ API pods + Redis and capture latency/throughput report.
- Wire web live salon UI (`Live Bidder Count` / energy meter / bid-reactive visuals) to WS stream.