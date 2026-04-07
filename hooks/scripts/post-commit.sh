#!/usr/bin/env bash
# Orbit Post-Commit Hook — writes checkpoint evidence + refreshes context.db

set -uo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$ROOT_DIR" ]]; then
  ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fi

# Write workflow checkpoint evidence for the current commit.
# Non-fatal: never block a commit if this script fails.
node "$ROOT_DIR/bin/post-commit-checkpoint.js" 2>/dev/null || true

"$ROOT_DIR/hooks/scripts/sync-context.sh" || true

exit 0
