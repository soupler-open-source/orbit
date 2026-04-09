# Orbit Command: /orbit:riper <task>

> Structured RIPER analysis with an executable inner recovery loop when Execute fails

## PROCESS

1. Load `skills/riper.md` for the outer loop: Research → Innovate → Plan → Execute → Review.
2. If Execute succeeds, continue the normal task flow and emit the standard Orbit status blocks.
3. If Execute fails inside the repo-local RIPER runtime, Orbit invokes the recovery controller automatically.
   Hook and manual bridge path:
   - `node bin/recovery-loop.js --command /orbit:riper --phase execute --task "<task>" --error-message "<failure>"`
4. The recovery controller must:
   - write `.orbit/state/last_error.json`
   - append a deterministic recovery trace to `SUMMARY.md` when a summary path is supplied
   - decide `retry` for bounded repeated failures and `halt` after the same failure repeats 3 times
5. On `halt`, Orbit must stop autonomous retrying and request human help through `/orbit:review` or operator intervention.

Output:

- RIPER runtime status
- recovery-loop decision when Execute fails
- deterministic next command (`/orbit:riper` retry or `/orbit:review` halt path)
