# Ship a pilot (process, not features)

**Ordered runbook:** [PILOT_SHIP.md](PILOT_SHIP.md) — execute those steps in sequence.  
**Dealer-ready line (API live):** `PILOT_VERIFY_API_URL=… pnpm run pilot:verify`.

This page is a short overview; **PILOT_SHIP.md** is the canonical checklist (including GitHub branch protection for `ci / build-and-api-e2e`).  
**Marketing WebGL + luxury UX budgets (non-blocking for pilot gate):** `docs/plans/2026-04-04-vex-ELITE-DIGITAL-PRESENCE-v1.md` §21+ · Crown Jewel spec `docs/plans/2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.0.md` · **Apex Studio `/build`:** `docs/plans/2026-04-05-vex-apex-studio-configurator-v1.0.md`.

This is the minimum **operational** bar between “code exists” and “we can put a dealer on it.” Engineering ships **process + proof**; GTM ships **dealers**.

## 1. What “shippable pilot” means here

- API and apps **build** on a clean machine (same as CI).
- Postgres schema matches code: **`prisma migrate deploy`** applied.
- **Tenant isolation** is verified by automation (`pnpm --filter @vex/api run test:e2e`), not by eyeballing Prisma.
- **Health**: load balancers hit `GET /health` — `db: ok` before sending traffic.
- **Secrets**: real `JWT_SECRET`, valuation keys (or explicit dev-only skip **never** in prod), Stripe secrets if money moves, tight `CORS_ORIGIN` (not `*` in production).

## 2. CI is the contract

GitHub Actions workflow **`.github/workflows/ci.yml`** is the default gate: Postgres service → generate → migrate → turbo build → API tenant E2E.

If `main` is red, you are not shipping.

**Branch protection:** On GitHub, require status check **`ci / build-and-api-e2e`** on `main` (exact steps in [PILOT_SHIP.md](PILOT_SHIP.md) Step 0).

## 3. Local gate (mirror CI)

With Postgres running and `DATABASE_URL` set (see `apps/api/.env.example`):

```bash
pnpm run ship:gate
```

That runs Prisma generate, full monorepo build, `migrate deploy`, and the appraisal isolation E2E. Without `DATABASE_URL`, the script exits with instructions — fix env before calling anything “pilot-ready.”

## 4. Day-of deploy checklist

1. **Database**: backup if not empty; run migrations on the target DB.
2. **API**: set env from `apps/api/.env.example` (production values); start process; confirm `GET /health` → 200 and `db: ok`.
3. **Web + CRM**: deploy with the **same** `NEXT_PUBLIC_API_URL` as the API public origin.
4. **Smoke** (manual, 2 minutes): open CRM login; create or view one appraisal; hit public branding URL if white-label pilot (`docs/pilot-white-label-dns.md`).
5. **Rollback**: keep previous API image / revision and DB backup; revert traffic first, then decide on schema rollback with care.

## 5. What this document does *not* replace

- Sales contract, SLA, or support runbooks.
- SOC2 / pen test — separate track.
- “Investor dashboard” copy — must point at **real** auth + data or stay unpublished.

## 6. Related commands


| Command                        | Purpose                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| `pnpm run ship:gate`           | Local mirror of CI ship bar (needs `DATABASE_URL`)                                               |
| `pnpm run pilot:verify`        | **Deployed API** smoke: set `PILOT_VERIFY_API_URL` (and optional `PILOT_VERIFY_BRANDING_DOMAIN`) |
| `pnpm run release:pilot-check` | Turbo build + tenant E2E (`test:e2e`, needs `DATABASE_URL`)                                      |
| `pnpm -w turbo run build`      | Compile only — insufficient alone for pilot                                                      |


Stale “no tenant / no Stripe” memos: see [ENGINEERING_REALITY.md](ENGINEERING_REALITY.md).