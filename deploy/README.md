# Deploy (API + data stores)

This folder is **API-first**: Postgres and Redis run here; `apps/web` and `apps/crm` should be hosted on a second platform (Vercel, Fly.io, Railway, …) with the same `NEXT_PUBLIC_API_URL` pointing at this API.

## Compose

From the repo root:

```bash
cd deploy
cp .env.example .env
# Or merge secrets from ../apps/api/.env.example into .env
# Edit .env: JWT_SECRET, CORS_ORIGIN (comma-separated, no *), valuation keys, Stripe.
# Compose sets DATABASE_URL / REDIS_URL for the bundled Postgres + Redis; omit or override those if you use external services.
docker compose up --build
```

For a quick local stack **without** live valuation keys, set in `.env`:

`SKIP_VALUATION_ENV_CHECK=1`  
(Remove this in any real pilot or production environment.)

Kubernetes: mirror the same env contract—secrets for `JWT_SECRET`, Stripe, and valuation providers; `NODE_ENV=production`; tight `CORS_ORIGIN`; do **not** set `SKIP_VALUATION_ENV_CHECK`.

## Image

`Dockerfile.api` builds `@vex/shared` and `@vex/api`, runs `prisma migrate deploy` on container start, then `node dist/index.js`.

## Health checks (load balancer / pilot)

- **`GET /health`** — expect **200** and JSON with `db: "ok"` and `status: "ok"` before sending customer traffic.
- **`GET /`** — quick JSON sanity check (API marker).

After the container or process is reachable at your public API origin (TLS + DNS):

```bash
export PILOT_VERIFY_API_URL="https://api.your-domain.com"
# Optional white-label smoke (pilot tenant customDomain):
# export PILOT_VERIFY_BRANDING_DOMAIN="dealer.example.com"
pnpm run pilot:verify
```

Exit **0** = automated dealer-ready smoke passed. Runbook: [docs/PILOT_SHIP.md](../docs/PILOT_SHIP.md).

## Demo data (optional)

With API env pointed at the same database:

```bash
cd ../apps/api && pnpm exec prisma db seed
```

(See `apps/api/prisma/seed.ts` — change default passwords in production.)
