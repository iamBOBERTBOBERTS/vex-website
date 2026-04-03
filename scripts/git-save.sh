#!/usr/bin/env bash
# Commit all tracked changes and push the current branch.
# Usage:
#   pnpm run git:save -- "feat: your message"
#   GIT_SAVE_MSG="fix: typo" pnpm run git:save
#   GIT_AUTHOR_EMAIL=you@example.com GIT_AUTHOR_NAME="You" pnpm run git:save -- "chore: sync"
#
# If the working tree is clean, only pushes (e.g. after amend or local commits).
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

REMOTE="${GIT_REMOTE:-origin}"
BRANCH="$(git branch --show-current)"

if [[ -z "$BRANCH" ]]; then
  echo "git-save: not on a branch"
  exit 1
fi

have_identity() {
  git config user.email >/dev/null 2>&1 && git config user.name >/dev/null 2>&1
}

commit_cmd() {
  local msg="$1"
  if [[ -n "${GIT_AUTHOR_EMAIL:-}" ]]; then
    git -c "user.email=${GIT_AUTHOR_EMAIL}" -c "user.name=${GIT_AUTHOR_NAME:-VEX Developer}" commit -m "$msg"
  elif have_identity; then
    git commit -m "$msg"
  else
    echo "git-save: set identity — one of:"
    echo "  git config user.email 'you@example.com' && git config user.name 'Your Name'"
    echo "  export GIT_AUTHOR_EMAIL=... GIT_AUTHOR_NAME=..."
    exit 1
  fi
}

push_branch() {
  if git rev-parse --abbrev-ref "${BRANCH}@{upstream}" >/dev/null 2>&1; then
    git push "$REMOTE" "$BRANCH"
  else
    git push -u "$REMOTE" "$BRANCH"
  fi
}

if [[ -z "$(git status --porcelain)" ]]; then
  echo "git-save: working tree clean — pushing only"
  push_branch
  echo "git-save: OK (push)"
  exit 0
fi

git add -A

MSG="${*:-}"
if [[ -z "$MSG" ]]; then
  MSG="${GIT_SAVE_MSG:-}"
fi
if [[ -z "$MSG" ]]; then
  MSG="chore: sync $(date -u +%Y-%m-%dT%H:%MZ)"
fi

commit_cmd "$MSG"
push_branch
echo "git-save: OK (commit + push)"
