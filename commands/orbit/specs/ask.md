# Orbit Command: /orbit:ask <question>

> Query project state mid-session — decisions, todos, blockers, version

## PROCESS

1. If `.orbit/context.db` exists: query it for the answer (uses structured tables).
   Falls back to `.orbit/state/STATE.md` if context.db not present — fully functional without context.db.
2. Read STATE.md (or context.db output) and answer the question directly.
3. Cite the source: decisions log, tasks table, or project facts.
4. If question references a decision, quote the rationale field verbatim.

**Examples:**

```
/orbit:ask what is blocking v2.9.0 wave 2?
/orbit:ask why did we choose SQLite for context.db?
/orbit:ask what did we complete today?
/orbit:ask what is the current version?
/orbit:ask what are the open todos this milestone?
```
