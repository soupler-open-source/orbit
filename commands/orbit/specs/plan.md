# Orbit Command: /orbit:plan [N]

> Research + design + break into executable tasks for phase N

## PROCESS

**Emit at start:**

```
━━━ Orbit ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Domain:     {DOMAIN}
  Complexity: PHASE
  Agent:      architect + researcher
  Mode:       {COLLABORATIVE|AUTONOMOUS}
  Milestone:  {active milestone}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Load `skills/planning.md`. If N not specified, use next unplanned phase from ROADMAP.md.

1. Read STATE.md + ROADMAP.md + REQUIREMENTS.md
2. Spawn researcher subagent for this phase's domain
3. Design wave execution for phase N (which tasks can parallelize?)
4. Produce phase plan as XML task definitions
5. Verify plan against requirements (can a fresh engineer execute this unambiguously?)
6. Output: `PHASE-{N}-PLAN.md` with wave-structured task XML
