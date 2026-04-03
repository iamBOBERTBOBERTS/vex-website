#!/usr/bin/env bash
# Same as git-save.sh but runs a full monorepo build first (AGENTS.md ship bar for code quality).
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
pnpm -w turbo run build
exec bash scripts/git-save.sh "$@"
