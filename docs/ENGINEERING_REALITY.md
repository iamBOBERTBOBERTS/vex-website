# Engineering reality vs. generic gap memos

External “gap analyses” often assume **greenfield**. This repo already contains substantial implementation; priorities should target **gaps and hardening**, not re-building what exists.

| Claim sometimes seen | Actual repo state (verify in tree) |
|---------------------|-----------------------------------|
| No tenant middleware / Prisma scoping | `apps/api/src/middleware/tenant.ts`, `apps/api/src/lib/tenant.ts` — AsyncLocalStorage + `$use` scoping; unsafe unique ops blocked by design. |
| No RBAC | `requireAuth`, roles on many routes; **systematic 100% coverage is still a valid audit task** (AGENTS.md non-negotiable). |
| No Stripe / webhooks | `apps/api/src/routes/stripe.ts`, `apps/api/src/lib/stripe.ts`, webhook signature path; **idempotency and lifecycle completeness** remain hardening work. |
| Valuation not wired | `apps/api/src/lib/valuation.ts`, `POST /appraisals/valuate`, `ValuationCache`, daily cap — **production keys + dealer-trusted outputs** are the real gap. |
| No public trade-in | `POST /public/quick-appraisal`, `GET /public/quick-appraisal/:id`, tenant resolution documented in `docs/pilot-white-label-dns.md`. |
| No MRR / metrics | `GET /admin/mrr`, `GET /metrics` (Prometheus); **telemetry completeness** and investor copy must match real auth/data. |

**Tenant table caveat:** Prisma middleware does not inject `tenantId` into `Tenant` queries. Unscoped `tenant.findMany()` returns **every** tenant — several investor/scaling helpers were fixed to filter by `req.tenantId`; see `docs/TENANT_RBAC.md`.

**Production boot:** With `NODE_ENV=production`, the API exits on startup if `CORS_ORIGIN` is missing or `*`, if `SKIP_VALUATION_ENV_CHECK` is set, or if required valuation keys are missing (unless you only run non-production — see `apps/api/src/lib/productionEnv.ts` and `index.ts`).

**Health checks vs tenant middleware:** `GET /health` is anonymous and runs **outside** `runWithTenant`. The app-wide `basePrisma` client uses `$use` middleware that calls `requireTenantOrThrow()` for almost all operations, so **`basePrisma.$queryRaw` in `/health` would fail** without tenant context. The intended pattern is a **small dedicated `PrismaClient`** with **no** tenant middleware — `apps/api/src/lib/healthPrisma.ts` — used only by `routes/health.ts`. Same goal as before: load balancers get a reliable DB ping without JWT or tenant headers.

**What is still true:** no substitute for **paying pilots**, **end-to-end dealer workflows**, **CI green on `main`**, and **`pnpm run pilot:verify`** against a live API. Use `docs/PILOT_SHIP.md` for the ordered bar, not slide-deck assertions alone.

**WebGL / cinematic marketing bar (separate from API pilot gate):** `docs/plans/2026-04-04-vex-ELITE-DIGITAL-PRESENCE-v1.md` §21–§27 — perf budgets, LOD, and investor narrative; do not confuse with tenant/RBAC correctness above.
