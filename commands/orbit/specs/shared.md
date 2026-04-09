# Orbit Runtime Contracts

> Loaded by every Orbit command. Contains the STATE.md update protocol and the standard output block formats.

---

# STATE.md Update Protocol

> Standing rule — applies to every Orbit command, every session

STATE.md is Orbit's memory. It must stay current without being asked. Update it automatically whenever any of the following occur:

| Trigger                                       | What to write                                                    |
| --------------------------------------------- | ---------------------------------------------------------------- |
| Issue completed (PR merged or task done)      | Move item from Todos to Last 5 Completed Tasks                   |
| Decision made (architecture, scope, approach) | Add row to Decisions Log with date, version, decision, rationale |
| New issue created                             | Add to appropriate wave/milestone in Todos                       |
| Blocker encountered                           | Add to Todos with `BLOCKED:` prefix and reason                   |
| Blocker resolved                              | Remove from Todos, add resolution to Decisions Log               |
| Clarification required                        | Add `CLARIFICATION_REQUESTED` entry under Clarification Requests |
| Milestone shipped                             | Update Active Milestone, Current Version, add to Decisions Log   |
| Session produces significant context          | Update Project Context if active phase/milestone changed         |

**Rules:**

- Never wait to be asked. Update STATE.md as part of completing any task.
- Decisions Log entries must include rationale — not just what was decided, but why.
- Last 5 Completed Tasks: always most recent first, always include issue number if applicable.
- If STATE.md does not exist, create it before doing any other work.

---

# Orbit Runtime Status Contract

> Standard live output emitted by Orbit commands and runtime helpers

Orbit should always surface what it is doing, not just the final result.

## Required blocks

### Start banner

Used by `/orbit:quick`, `/orbit:plan`, `/orbit:build`, and similar command entry points.

```
━━━ Orbit ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Domain:     {DOMAIN}
  Complexity: {COMPLEXITY}
  Agent:      {AGENT}
  Mode:       {MODE}
  Working target: {Issue #{NNN}|untracked task}
  Branch:     {branch name}
  PR:         {#NNN|not opened yet}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Mid-session execution block

Used by `/orbit:progress` and `/orbit:resume` when work is already in progress.

```
━━━ Current Execution ━━━━━━━━━━━━━━━━━━━
  Command:  {command}
  Agent:    {agent}
  Wave:     {wave}
  Status:   {status}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

When the active task is tracked work, append the workflow gate block:

```
━━━ Workflow Gate ━━━━━━━━━━━━━━━━━━━━━
  State:    {state}
  PR Gate:  {ready|blocked}
  Next:     {next transition}
  Command:  {next command}
  Blocker:  {reason if blocked}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Completion footer

Appended at the end of completed commands so the user has a concrete next step.

```
---
## Recommended Next Command

**Primary**: {next command}
**Why**: {one sentence}

**Alternatives**:
- {alt 1}
- {alt 2}
```

### Token usage footer

**Mandatory. Appended at the end of every command, after the completion footer.**

At command completion, Claude must:

1. Estimate token usage for this command:
   - **Input**: sum of (bytes of every file read this command / 4) + system context floor (~15,000 tokens)
   - **Output**: total chars written in this response / 4
2. Log the entry:
   ```
   node bin/token-log.js --command /orbit:<name> --tokens-input N --tokens-output N
   ```
3. Append this block to the response:

```
---
⬡ Token Usage  /orbit:<name>
  Input:  ~N tokens
  Output: ~N tokens
  Total:  ~N tokens
```

**Exceptions** (skip the log step, still show the block with estimated values):
- `bin/token-log.js` itself cannot be run (file missing, node not available) — show the block with `(not logged)` suffix
- `/orbit:cost` — already surfaces the token log; no duplicate entry needed

## Review residual rule

When `/orbit:review` ends with residual risks, Orbit must classify each one explicitly:

- `Tracked by #...` for a linked hardening or follow-up issue
- `Waived: ...` for an intentionally accepted risk with rationale
- `Operational: ...` for branch hygiene, CI timing, or other non-product follow-up work

Do not leave residual risks as unlabeled prose.
