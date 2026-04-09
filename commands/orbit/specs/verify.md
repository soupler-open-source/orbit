# Orbit Command: /orbit:verify [N]

> Human + automated verification of phase N deliverables

## PROCESS

1. Extract testable deliverables from `PHASE-{N}-PLAN.md`
2. Run automated checks: all tests pass, linter passes, type checks pass
3. Present each user-facing deliverable for UAT:
   ```
   Deliverable: User can log in with email + password
   How to test: navigate to /login, enter credentials
   Pass? [yes/no/partially]
   ```
4. For any failures: spawn debug subagent to find root cause + create fix task
5. Output: `PHASE-{N}-UAT.md` with results

**After completion, emit:**

```
---
**What's next**: /orbit:ship {N} — ship phase {N} (UAT passed)
```
