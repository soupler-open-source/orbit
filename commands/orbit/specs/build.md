# Orbit Command: /orbit:build [N]

> Execute phase N using parallel wave architecture

## PROCESS

**Emit at start:**

```
━━━ Orbit ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Domain:     {DOMAIN}
  Complexity: PHASE
  Agent:      engineer (+ specialist agents per wave)
  Mode:       {COLLABORATIVE|AUTONOMOUS}
  Phase:      {N} — {phase name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Read `PHASE-{N}-PLAN.md`. For each wave:

**Dispatch subagents in parallel** (one per task in the wave):

```
Subagent context: {task XML} + {relevant ARCH.md sections} + {STATE.md} + {tech stack}
Subagent instruction: Execute exactly this task. Load the skills it requires. TDD always.
Commit atomically when done. Write SUMMARY.md.
```

**After each wave, emit:**

```
━━━ Wave {N} Complete ━━━━━━━━━━━━━━━━━━━
  ✓ {task 1 title} — committed
  ✓ {task 2 title} — committed
  ✗ {task 3 title} — BLOCKED: {reason}  (if applicable)
  Next: Wave {N+1} → {agent(s)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Collect SUMMARY.md files. Check for blockers before next wave.

After all waves: run verification subagent:

```
Verify: does the codebase deliver everything Phase N promised?
Check against REQUIREMENTS.md. Output: PHASE-{N}-VERIFICATION.md
```

Update STATE.md with phase completion.

**After completion, emit:**

```
---
**What's next**: /orbit:verify {N} — run UAT and automated verification
**Why**: build complete — verification required before ship
```
