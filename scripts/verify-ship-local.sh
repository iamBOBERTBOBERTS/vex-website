#!/usr/bin/env bash
# Run from anywhere: full build + API e2e + ship gate (requires Node 20+ on PATH + DATABASE_URL).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node is not on PATH."
  echo "  CachyOS/Arch: sudo pacman -S nodejs npm"
  echo "  Or use fnm/nvm/asdf with Node >= 20 (see package.json engines)."
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "ERROR: pnpm is not on PATH. Try: corepack enable && corepack prepare pnpm@9.15.9 --activate"
  exit 1
fi

# Optional: load DATABASE_URL / JWT from apps/api/.env.local
if [[ -f apps/api/.env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source apps/api/.env.local
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set."
  echo "  Example: export DATABASE_URL='postgresql://user:pass@localhost:5432/vex'"
  echo "  Use a direct postgres:// URL for Prisma CLI and e2e scripts (not prisma:// Accelerate)."
  exit 1
fi

echo "==> Node $(node --version) | cwd: $ROOT"
# After Docker/sudo builds, root-owned dist/ breaks turbo — fix before build when needed.
if [[ -d "$ROOT/packages/shared/dist" ]] && ! [[ -w "$ROOT/packages/shared/dist" ]]; then
  echo "==> packages/shared/dist not writable; running fix:perms"
  pnpm run fix:perms
fi

echo "==> turbo build"
pnpm -w turbo run build

echo "==> API e2e"
pnpm --filter @vex/api run test:e2e

echo "==> ship:gate"
pnpm run ship:gate

echo "==> Done."
echo "    Optional: PILOT_VERIFY_API_URL=https://api.yourdomain.com pnpm run pilot:verify"
echo "    (Skip placeholder hosts like *.example — script exits 0.)"
echo "    If build showed EACCES on dist/: run pnpm run fix:perms"
exit 0
