# Orbit Command: /orbit:progress

> Current project status — where are we, what's next, what's blocked

## PROCESS

Read STATE.md + ROADMAP.md. Output:

```
Project: {name}
Milestone: {M} — {name}
Phase status:
  ✅ Phase 1 — {name} (shipped)
  ✅ Phase 2 — {name} (shipped)
  🔄 Phase 3 — {name} (building, Wave 2 of 3)
  ⏳ Phase 4 — {name} (not started)
  ⏳ Phase 5 — {name} (not started)

Blockers: {list or "none"}
Next action: /orbit:build 3 to complete Wave 3
```

If called mid-session while a build or quick command is in progress, also emit:

```
━━━ Current Execution ━━━━━━━━━━━━━━━━━━━
  Command:  /orbit:{command}
  Agent:    {active agent}
  Wave:     {N} of {total}  (if applicable)
  Status:   {in progress|waiting for subagent|blocked}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

For tracked work, append the workflow gate block after the execution block so the operator can see whether the task is still in implementation, ready for review, or ready for PR.

Then append the recommended next command block from the runtime status contract.
