#!/usr/bin/env bash
# Orbit Stop Hook — Runs when Claude Code session ends (agent responds with final answer)
# Saves session summary and updates STATE.md timestamps.

set -euo pipefail

STATE_DIR="${AGENTIC_FRAMEWORK_STATE_DIR:-.orbit/state}"
STATE_FILE="$STATE_DIR/STATE.md"
SESSION_LOG="$STATE_DIR/sessions.log"

mkdir -p "$STATE_DIR"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
LAST_COMMIT_MSG=$(git log -1 --pretty=%s 2>/dev/null || echo "no commits")

# Append session record to sessions log
cat >> "$SESSION_LOG" << SESSION

## Session: $TIMESTAMP
- Branch: $GIT_BRANCH
- Last commit: $GIT_COMMIT — $LAST_COMMIT_MSG
- Recent changes:
$(git log --oneline -5 2>/dev/null | sed 's/^/  /' || echo "  none")
SESSION

# Update STATE.md last-updated timestamp if it exists
if [[ -f "$STATE_FILE" ]]; then
  # Update the last-updated line if present
  if grep -q "Last Updated:" "$STATE_FILE" 2>/dev/null; then
    sed -i.bak "s/Last Updated:.*/Last Updated: $TIMESTAMP/" "$STATE_FILE" 2>/dev/null && rm -f "${STATE_FILE}.bak" || true
  fi
fi

# Keep the structured cache aligned with the human-readable state file.
ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$ROOT_DIR" ]]; then
  ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fi

"$ROOT_DIR/hooks/scripts/sync-context.sh" || true

SNAPSHOT_FILE="$STATE_DIR/pre-compact-snapshot.md"

# Write snapshot on normal session end — same file /orbit:resume reads.
# Without this, the snapshot only exists after auto-compaction, not after
# deliberate exits — the exact moment resume context is most needed.
cat > "$SNAPSHOT_FILE" << SNAPSHOT
# Orbit Pre-Compact Snapshot
> Session ended at: $TIMESTAMP

## Session State at End
- Branch: \`$GIT_BRANCH\`
- Last commit: \`$GIT_COMMIT\`
- Snapshot saved: $TIMESTAMP

## Recent Commits
\`\`\`
$(git log --oneline -10 2>/dev/null || echo "git log unavailable")
\`\`\`

## Uncommitted Changes
\`\`\`
$(git diff --stat 2>/dev/null || echo "none")
\`\`\`

## Resume Instructions
1. Run \`/orbit:resume\` in the new session
2. This loads STATE.md + this snapshot
3. Check commits above to reconstruct what was in progress
4. Continue from last atomic task boundary
SNAPSHOT

echo "Orbit: Session recorded and snapshot saved at $TIMESTAMP (branch=$GIT_BRANCH, commit=$GIT_COMMIT)" >&2
exit 0
