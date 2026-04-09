# Orbit Command: /orbit:discover

> Validate the problem, target user, and go/no-go case before committing to build

## PROCESS

Load `skills/brainstorming.md`. Then:

1. Read the stated problem, target user hypothesis, and any existing context artifacts.
2. Dispatch:
   - `researcher` for problem validation, market reality, and opportunity sizing
   - `designer` for user framing, UX assumptions, and interview/validation angles
3. Produce `DISCOVERY.md` with:
   - problem framing
   - user insights and assumptions
   - opportunity sizing
   - open questions and validation gaps
   - go / no-go recommendation
4. Surface blockers or missing evidence instead of pretending the problem is validated.
5. If the recommendation is go, hand off to `/orbit:new-project`.

**After completion, emit:**

```
---
**What's next**: /orbit:new-project — turn validated discovery into requirements and roadmap
**Why**: discovery clarified the problem and target user well enough to plan the project
```
