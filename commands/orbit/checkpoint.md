---
id: orbit-checkpoint
doc_type: command
status: Active
version: v1
last_updated: 2026-04-07
---

# Orbit Command: /orbit:checkpoint

> Explicit session save-point — write current progress to checkpoint manifest, STATE.md, and context.db before closing a terminal or switching context.

## WHEN TO USE

- Before closing a terminal intentionally (avoids the stale-state problem on `/orbit:resume`)
- Before switching to a different task or machine
- After a significant step you want to preserve (review run, tests green)
- Before a long-running operation where you want a known-good snapshot

## SYNTAX

```
/orbit:checkpoint [--review-status <approved|changes_requested>]
                  [--tests-status <passed|failed>]
                  [--pr-status <open|merged|not_open>]
                  [--issue <#NNN>]
```

All flags are optional. Without flags, the checkpoint records current branch + HEAD SHA + `implementationStatus: done`.

## PROCESS

1. Read current branch and HEAD SHA from git.
2. Infer issue number from branch name (e.g. `feat/227-slug` → `#227`).
3. Merge provided evidence into `.orbit/state/checkpoints/latest.json` under `workflow_evidence`.
4. Run `sync-context.sh` to update `context.db` and trigger STATE.md refresh.
5. Emit a confirmation block.

## OUTPUT

```
━━━ Orbit Checkpoint ━━━━━━━━━━━━━━━━━━
  Branch:   feat/227-self-enforcement-wave-1
  Issue:    #227
  Head SHA: abc1234
  State:    {"implementationStatus":"done","testsStatus":"passed",...}
  Written:  .orbit/state/checkpoints/latest.json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## IMPLEMENTATION

```
node bin/checkpoint.js [flags]
```
