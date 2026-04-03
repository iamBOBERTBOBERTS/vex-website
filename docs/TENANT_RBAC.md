# Tenant isolation + RBAC (living notes)

## Tenant isolation

- **Prisma:** `runWithTenant` + `$use` middleware on `prisma` (`lib/tenant.ts`). The **`Tenant` model is exempt** from auto-scoping — `tenant.findMany()` without a `where` clause can return **all** tenants. Call sites must use `where: { id: req.tenantId }` (or `findFirst`) whenever the caller is a normal tenant-scoped request.
- **Fixed leak class (2026-04):** `adminController`, `capital` raise package, `scaling` overview, `liquidity` / `forecasting` helpers previously aggregated **every** tenant; they are now **scoped to `req.tenantId`** (or `tenantId` argument). Platform-wide admin, if needed later, should use an explicit `basePrisma` + separate auth (e.g. env-gated operator role), not tenant JWTs.
- **Health:** `GET /health` uses **`healthPrisma`** only — no tenant ALS (see `ENGINEERING_REALITY.md`).

## RBAC

- **Middleware:** `requireAuth`, `requireRole(...)` (`middleware/auth.ts`, `middleware/requireRole.ts`).
- **Dealer staff:** `isDealerStaffRole()` in `lib/dealerRole.ts` = `STAFF | ADMIN | GROUP_ADMIN` for CRM-style controllers (customers, leads, orders, inventory mutations, dashboard, appraisals).
- **`GROUP_ADMIN`:** Included on **appraisals**, **analytics**, **AI insights** routes alongside STAFF/ADMIN so group operators are not locked out of dealer tooling.
- **Orders:** Customers see **own** orders only; staff-like roles see all (see `ordersController`).

## Verification

```bash
pnpm --filter @vex/api run test:e2e
```

Runs appraisal + inventory tenant isolation scripts. CI and `ship:gate` use the same command.

## Remaining audit surface

- Routes that only use `requireAuth` without `requireRole` rely on **controller** checks — prefer route-level `requireRole` for new code.
- **Public** and **pilot** routers stay unauthenticated by design; review when exposing new paths.
