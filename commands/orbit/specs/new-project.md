# Orbit Command: /orbit:new-project

> Initialize a brand new project from scratch

## PROCESS

Load `skills/brainstorming.md`. Then:

1. **Intent extraction** — Ask up to 5 targeted questions to understand the full scope. Never start before understanding: who uses this, what success looks like, what constraints exist, what already exists.

2. **Research** — Spawn a researcher subagent with this prompt:

   ```
   You are a Research Agent. Investigate the domain: {domain}.
   Research axes: ecosystem landscape, technology options, proven patterns, pitfalls at scale.
   Output: {N}-RESEARCH.md with executive summary, option comparison, recommendation, pitfalls.
   ```

3. **Produce project artifacts**:
   - `PROJECT.md` — vision, goals, constraints, success criteria
   - `REQUIREMENTS.md` — v1/v2/out-of-scope with rationale
   - `ROADMAP.md` — phases mapped to requirements
   - `.orbit/state/STATE.md` — initial state document

4. **Present roadmap** in sections for approval. Adjust based on feedback.

5. Once approved — output:
   ```
   Project initialized. Run /orbit:plan 1 to plan Phase 1.
   ```
