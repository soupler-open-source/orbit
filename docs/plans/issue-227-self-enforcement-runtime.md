---
id: issue-227-self-enforcement-runtime
doc_type: plan
status: Active
version: v1
last_updated: 2026-04-07
scope: issue-227
phase: Wave 0.5 — Foundation Hardening
rank: 055
priority: P0
depends_on:
  - v2.9.0-wave-0.5-foundation-hardening
blocks:
  - v2.9.0-wave-4-ship-positioning
---

# Issue #227 — Orbit Self-Enforcement Runtime
> Wire the gap between documented and actual workflow compliance

**Issue**: soupler-hq/orbit#227
**Milestone**: v2.9.0 — Wave 0.5 (Foundation Hardening)
**Created**: 2026-04-07

---

## Problem Statement

Orbit documents world-class principles — RIPER loop, wave architecture, review gates, agent dispatch, checkpoint manifests — but they are not enforced at runtime. The LLM bypasses every documented gate because the enforcement machinery exists in isolation, unwired from the actual execution path.

The machinery is almost entirely built. This is a **wiring problem**, not a rebuild.

### Root Cause Diagram

```
What Orbit says should happen:          What actually happens:
─────────────────────────────           ────────────────────────────
/orbit:quick                            LLM edits files directly
  → RIPER: plan phase                   LLM runs git commands directly
  → engineer subagent dispatched        LLM calls PR controller directly
  → implementation_done written         No checkpoint written
  → tests run → testsStatus written     No workflow state read
  → review dispatched                   pre-tool-use: only checks safety
  → reviewStatus written                PR opens with no gate check
  → assertPullRequestReady() passes
  → PR controller opens PR
```

### Key Finding

`workflow-state.js` has `assertPullRequestReady()` that would have blocked PR #226 from opening without review — but **nothing calls it with actual evidence in the execution path**. The single enforcement point that could have stopped the skip (`pre-tool-use.sh`) is not wired to workflow state.

---

## What's Already Built (Do Not Rebuild)

| File | Status | Gap |
|------|--------|-----|
| `bin/workflow-state.js` | ✅ complete state machine | Not called by pre-tool-use |
| `bin/checkpoint-manifest.js` | ✅ 182 lines | Never written to; `checkpoints/latest.json` has never existed |
| `bin/quick.js` | ✅ auto-chain + review dispatch | Review gated behind `--execute-review-action true`; LLM never passes it |
| `hooks/scripts/pre-tool-use.sh` | ✅ runs before every tool | Only checks clarification gate + safety; no workflow state check |
| `bin/pull-request-controller.js` | ✅ PR body governance | Never calls `assertPullRequestReady()` |
| `bin/review.js` | ✅ review runner | Result never written to checkpoint |

---

## Implementation Plan

### Wave 1 — Checkpoint Writes (Foundation)

**Dependency**: everything else depends on this. Do not start Wave 2 until checkpoint writes are confirmed working.

**Task 1.1 — post-commit hook writes checkpoint**
- File: `hooks/scripts/post-commit.sh`
- After every commit, write `.orbit/state/checkpoints/latest.json` with:
  ```json
  {
    "issue": "<inferred from branch>",
    "branch": "<current branch>",
    "implementationStatus": "done",
    "testsStatus": "unknown",
    "reviewStatus": "not_requested",
    "prStatus": "not_open",
    "updatedAt": "<ISO timestamp>"
  }
  ```
- Use `bin/workflow-state.js inferIssueFromBranch()` for issue inference
- Idempotent: merge into existing checkpoint if present, don't overwrite review/test evidence

**Task 1.2 — review.js writes checkpoint on clean result**
- File: `bin/review.js`
- After a clean review run, merge into checkpoint:
  ```json
  {
    "reviewStatus": "approved",
    "reviewEvidenceStatus": "present",
    "shipDecisionStatus": "approved"
  }
  ```
- On changes_requested: write `reviewStatus: "changes_requested"`

**Task 1.3 — verify.js writes checkpoint on green tests**
- File: `bin/verify.js`
- After tests pass, merge into checkpoint:
  ```json
  {
    "testsStatus": "passed",
    "testEvidenceStatus": "present"
  }
  ```

**Task 1.4 — /orbit:checkpoint command**
- New file: `commands/orbit/checkpoint.md`
- New entry: `bin/checkpoint-manifest.js` exposed as a callable command
- Writes current in-session progress to STATE.md + `checkpoints/latest.json` + syncs context.db
- Use case: before closing a terminal intentionally; before switching context
- Document in `commands/commands.md` and `WORKFLOWS.md`

**Verification**: after a commit on a feature branch, `checkpoints/latest.json` must exist with correct branch + issue + implementationStatus.

---

### Wave 2 — PR Gate Enforcement (pre-tool-use)

**Dependency**: Wave 1 (checkpoint must be written before this gate can read it)

**Task 2.1 — pre-tool-use intercepts PR commands**
- File: `hooks/scripts/pre-tool-use.sh`
- Intercept any command that contains `pull-request-controller` or `gh pr create`
- Read `checkpoints/latest.json`
- Call: `node bin/workflow-state.js --guard pr_open --json "$(cat checkpoints/latest.json)"`
- If exit code non-zero: write the blocker message to stderr and `exit 2` (blocks the tool call)
- If `checkpoints/latest.json` is missing: warn but do not hard-block (graceful degradation)

**Task 2.2 — pull-request-controller validates workflow state**
- File: `bin/pull-request-controller.js`
- Before calling `gh pr create`, call `assertPullRequestReady()` with checkpoint evidence
- On failure: print the workflow gate block and exit 1

**Verification**: attempt to open a PR immediately after commit (no review run). The gate must block with:
```
[ERR-ORBIT-007] Cannot move from tests_green to pr_open. Next allowed transition: review_required.
```

---

### Wave 3 — Review Gate Enforcement

**Dependency**: Wave 2

**Task 3.1 — quick.js: review execution on by default**
- File: `bin/quick.js`
- Change: `reviewExecutionEnabled` defaults to `true`
- To skip review, operator must explicitly pass `--skip-review true`
- Update: `commands/commands.md` to document the new default

**Task 3.2 — post-commit guidance when tests_green and no review**
- File: `hooks/scripts/post-commit.sh`
- After writing checkpoint, evaluate state via `workflow-state.js`
- If state is `implementation_done` or `tests_green` and reviewStatus is `not_requested`, print:
  ```
  ━━━ Orbit Workflow Gate ━━━━━━━━━━━━━━━━
    State:   tests_green
    Next:    review_required
    Command: /orbit:review
    Reason:  Review is required before PR can open.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

**Verification**: run `/orbit:quick` without review. Post-commit guidance must fire. Subsequent PR attempt must be blocked by Wave 2 gate.

---

### Wave 4 — RIPER Phase Tracking

**Dependency**: Wave 1

**Task 4.1 — riper.js writes phase transitions to checkpoint**
- File: `bin/riper.js`
- After each phase (Research, Innovate, Plan, Execute), merge into checkpoint:
  ```json
  {
    "riperPhase": "plan",
    "riperPlanDone": true
  }
  ```

**Task 4.2 — /orbit:quick always calls riper plan phase first**
- File: `bin/quick.js`
- Before moving to implementation, call `bin/riper.js --phase plan`
- If `checkpoints/latest.json` shows `riperPlanDone: false`, block implementation start with:
  ```
  RIPER plan phase required before implementation. Run: /orbit:riper plan #NNN
  ```

**Note**: This is the lowest-priority wave. Waves 1–3 are the critical path to enforcement. Wave 4 adds observability to the RIPER loop but does not change the fundamental gate structure.

---

### Wave 5 — Resume Reads Checkpoint First

**Dependency**: Wave 1

**Task 5.1 — orbit:resume priority order**
- File: `commands/commands.md` (resume process, step 1)
- New priority order:
  1. `checkpoints/latest.json` — primary workflow state (most current)
  2. `gh pr view` — GitHub PR state (authoritative for merge status)  ← already added in #225
  3. `context.db` — fast session cache
  4. `STATE.md` — human-readable ledger (fallback)
- If checkpoint shows `prStatus: merged` and `gh pr view` confirms, skip all "unshipped" analysis

---

## Execution Order

```
Wave 1 (foundation — all parallel)
  Task 1.1 post-commit checkpoint write
  Task 1.2 review.js checkpoint write
  Task 1.3 verify.js checkpoint write
  Task 1.4 /orbit:checkpoint command

Wave 2 (depends on Wave 1 — parallel)
  Task 2.1 pre-tool-use PR intercept
  Task 2.2 pull-request-controller gate

Wave 3 (depends on Wave 2 — parallel)
  Task 3.1 quick.js review default on
  Task 3.2 post-commit review guidance

Wave 4 + 5 (depends on Wave 1 — parallel, lower priority)
  Task 4.1 riper.js phase writes
  Task 4.2 quick.js riper enforcement
  Task 5.1 resume checkpoint priority
```

---

## Out of Scope for This Issue

- **Subagent dispatch enforcement**: requires LLM-level interception not available in current hooks. The LLM must choose to use the Agent tool. This is a behavioral constraint, not a technical one — deferred.
- **Wave parallelism enforcement**: architectural; the hook layer cannot force parallelism. Deferred.
- **OPERATIONAL-RULES.json expansion**: can be addressed in a follow-up once enforcement plumbing is live.

---

## Success Criteria

After this issue is complete:

1. Opening a PR without running `/orbit:review` first is **technically impossible** — `pre-tool-use.sh` blocks the command.
2. Closing a terminal mid-session and resuming loses no workflow state — checkpoint is written at every commit.
3. `/orbit:resume` correctly identifies merged vs. unshipped branches without reading stale STATE.md.
4. `/orbit:checkpoint` gives operators an explicit save-point before closing a terminal.
5. The gap between "what Orbit documents" and "what Orbit enforces" is closed for the critical path (PR gate, review gate, checkpoint continuity).
