# Orbit Command: /orbit:launch

> Turn shipped release artifacts into a launch plan, GTM checklist, and announcement draft

## PROCESS

Load `skills/planning.md`. Use the launch surface only after ship/release artifacts exist.

1. Read the shipped release summary, review evidence, and current state
2. Identify:
   - target audience
   - launch channels
   - launch timing
   - launch prerequisites and owners
3. Dispatch:
   - `launch-planner` for sequencing and checklist structure
   - `technical-writer` for the outward-facing announcement draft
4. Produce:
   - `LAUNCH-PLAN.md`
   - `GTM-CHECKLIST.md`
   - `ANNOUNCEMENT-DRAFT.md`
5. Surface any missing prerequisites as blockers instead of pretending launch readiness

**After completion, emit:**

```
---
**What's next**: /orbit:milestone — archive the shipped-and-launched phase or move to the next milestone slice
**Why**: launch planning is complete and the post-ship communication surface is ready
```
