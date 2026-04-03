#!/usr/bin/env bash
# Local mirror of .github/workflows/ci.yml — run before tagging a pilot.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Prisma generate"
pnpm --filter @vex/api run db:generate

echo "==> Monorepo build"
pnpm -w turbo run build

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo ""
  echo "ship-gate: DATABASE_URL is not set."
  echo "  Export a Postgres URL (e.g. from apps/api/.env) to run migrate + tenant isolation E2E."
  echo "  CI always runs the full gate; local builds above succeeded but pilot verification is incomplete."
  exit 1
fi

echo "==> Migrate deploy"
( cd apps/api && pnpm exec prisma migrate deploy )

export JWT_SECRET="${JWT_SECRET:-local-ship-gate-only}"
export SKIP_VALUATION_ENV_CHECK="${SKIP_VALUATION_ENV_CHECK:-1}"
export DIRECT_DATABASE_URL="${DIRECT_DATABASE_URL:-$DATABASE_URL}"

echo "==> API tenant isolation E2E (appraisal + inventory)"
pnpm --filter @vex/api run test:e2e

echo "ship-gate: OK"
