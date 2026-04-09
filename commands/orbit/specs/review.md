# Orbit Command: /orbit:review

> Full structured code + architecture review of current state

## PROCESS

Use `/orbit:review` on the active feature branch before opening or finalizing the PR for that branch. Use a second `/orbit:review` on `develop` only for accumulated wave or milestone integration review.

Before requesting review again after follow-up commits, refresh the PR body so `Summary`, `Issues`, `Ship Decision`, `Test plan`, and `Merge notes` still match the branch truth, and update the `Head SHA` marker so CI can detect stale PR descriptions.

If the review ends with residual risks, Orbit must record their disposition before treating the review as complete:

- link an existing hardening issue if the risk is already covered
- create a new hardening issue if the risk is still untracked
- or explicitly explain why no tracking issue is required

Treat this as a strict `track-or-waive` rule for residual risks. For Orbit self-hosting work, prefer placing the follow-up in the hardening stack such as `#163`.

Load `agents/reviewer.md`. Spawn reviewer subagent with:

- All changed files since last ship
- ARCH.md (to verify architectural alignment)
- REQUIREMENTS.md (to verify spec compliance)

Output: structured review with CRITICAL/HIGH/MEDIUM/LOW findings.
CRITICAL findings must be fixed before next ship.
