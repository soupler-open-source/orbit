# Orbit Command: /orbit:resume

> Reload project state and continue from where we left off

## CALL MODES

**Session-start mode** (default — called at the beginning of a new session):
Full resume: read STATE.md + pre-compact-snapshot + git log + output full status summary + next command.

**Mid-session mode** (called while work is already in progress):
Diff mode: show only what changed in STATE.md since session started — new decisions, new todos, new blockers. Flag externally-added items clearly. Skip git log and snapshot re-read.

> Use mid-session mode when: another session may have merged a PR and updated STATE.md, or when switching context within the same session.

**Cross-session protocol:**

> **Switching sessions?** Always run `orbit:resume` first in the new session.
> `context.db` is the fast structured cache; `STATE.md` is the human-readable ledger and fallback. Any session that skips resume is working blind.

## PROCESS

1. If `.orbit/context.db` exists: run `node bin/context.js --load minimal` for fast partial context load (~300 tokens).
   Fallback: Read `.orbit/state/STATE.md` directly if context.db absent.
   Also read `.orbit/state/pre-compact-snapshot.md` if it exists.
1a. Run `node bin/token-log.js --last` to surface the last logged command's token usage.
    Display it at the top of the resume output as:
    ```
    Last session:  {command}  in: {N}  out: {N}  total: {N} tokens
    ```
    If no entries exist, skip this line silently.
2. Run `git log --oneline -5` to confirm what was last committed.
3. **Cross-reference GitHub PR state** — if the current branch is not `develop` or `main`, run:
   ```
   gh pr view --json state,mergedAt,number,title
   ```
   Use the result to determine actual ship status before emitting any output:
   - `MERGED` → report the branch as shipped; do not flag its commits as unshipped work. Note the PR number and merge date.
   - `OPEN` → report as in-flight with the PR link.
   - `CLOSED` (not merged) → report as abandoned; flag for cleanup.
   - command fails / no PR found → branch is local-only; treat commits as unshipped.

   **Why this step is mandatory**: STATE.md and local git state can be stale after a terminal is closed without a checkpoint. GitHub is the authoritative source for PR merge status.
4. Output a status summary:
   - Active milestone + phase
   - Last 5 completed tasks
   - Open todos for current milestone
   - Any blockers

5. **Infer and output the Next Command block** using this decision table (first matching rule wins):

| STATE.md signal                                                                | Primary recommendation                             |
| ------------------------------------------------------------------------------ | -------------------------------------------------- |
| Active `/orbit:build [N]` in progress (wave incomplete)                        | `/orbit:build [N]` — continue wave execution       |
| Build complete, no `/orbit:review` recorded for current phase                  | `/orbit:review` — required before ship             |
| Review done, phase not yet shipped                                             | `/orbit:ship [N]` — open PR and deploy             |
| Last completed task was `/orbit:quick`, open issues remain in active milestone | `/orbit:quick #NNN <title>` — next unblocked issue |
| All milestone issues complete, next milestone defined                          | `/orbit:plan` — begin next milestone               |
| No active work / truly ambiguous                                               | `/orbit:next` — let Orbit auto-detect              |

Output format (always append this block):

```
---
## Recommended Next Command

**Primary**: /orbit:quick #NNN <issue title>
**Why**: <one sentence — current milestone state + why this is next>

**Alternatives**:
- /orbit:progress — review full milestone status
- /orbit:next — let Orbit auto-detect based on full state analysis
```

6. Continue work without requiring re-briefing.

7. Whenever a commit, push, stop, or pre-compact event occurs, refresh `context.db` from `STATE.md` so the structured cache stays current.

> **Tip**: Plain prompts are allowed. Orbit should infer the right workflow for tracked work. New scope still means a new Orbit task boundary, even when the user does not type the slash command explicitly.
> If the session is mid-flight, emit the current execution block and the completion footer before continuing.
