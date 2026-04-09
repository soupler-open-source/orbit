# Orbit Command: /orbit:ship [N]

> Create PR, deploy to staging/prod, update release state

## PROCESS

Load `skills/deployment.md`. Requires PHASE-{N}-UAT.md to exist and pass.

1. Run reviewer subagent across all changes in this phase
2. Block ship on any CRITICAL findings
3. Dispatch `technical-writer` for:
   - `CHANGELOG.md` entry updates
   - `README.md` / user-facing documentation updates when behavior changed
   - release-note wording that explains the shipped phase clearly
4. Ensure all commits are done (CHANGELOG, README, any doc updates) **before** invoking the PR controller. The controller captures HEAD at invocation time; any commit pushed after will make the embedded `Head SHA` stale and fail CI.
5. Create PR using the controller — never bare `gh pr create`:
   ```
   node bin/pull-request-controller.js \
     --issue "#N" \
     --branch "<branch>" \
     --title "<title>" \
     --commands "<cmd1> || <cmd2>"
   ```
6. If approved: deploy to staging → run smoke tests → deploy to prod
7. Tag release: `v{milestone}.{phase}`
8. Update STATE.md: phase marked shipped
9. Output: deployment summary + next phase hint

**After completion, emit:**

```
---
**What's next**: /orbit:plan — begin next phase  (or /orbit:milestone if all phases shipped)
**Why**: {one sentence — milestone state + what comes next}
```
