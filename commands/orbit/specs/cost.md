# Orbit Command: /orbit:cost

> Show current model routing config, per-command token estimates, and session usage

## PROCESS

Read `orbit.config.json`. Output:

### 1. Model Routing Table

```
Model Routing (from orbit.config.json → models.routing)
──────────────────────────────────────────────────────
  classify   → {routing.classify}   (intent routing, simple lookups)
  standard   → {routing.standard}   (coding, debugging, most tasks)
  reasoning  → {routing.reasoning}  (architecture, complex reasoning)
  security   → {routing.security}   (threat modeling, adversarial)

Override: edit orbit.config.json → models.routing
Example:  examples/model-routing.config.json
```

If `orbit.config.json` is missing or has no `models.routing` key, warn:

```
⚠️  No models.routing found in orbit.config.json — using CLAUDE.md defaults.
   Run: cp examples/model-routing.config.json orbit.config.json
```

### 2. Per-Command Token Estimates

Estimates are based on typical context loaded (system prompt + files read + output). These are approximations — actual usage varies with project STATE.md size, number of changed files, and subagent dispatch.

```
Per-Command Token Estimates (typical, estimate-based)
──────────────────────────────────────────────────────
  System prompt floor (CLAUDE.md × 2 + memory)  ~15,000 tokens  [every turn]

  /orbit:resume      ~21,000 tokens  (was ~33k before specs split)
  /orbit:quick       ~22,000–31,000  (varies with code files loaded)
  /orbit:review      ~35,000–65,000  (scales with diff size)
  /orbit:plan        ~34,000–50,000  (researcher subagent)
  /orbit:build       ~25,000–48,000  per wave (scales with task count)
  /orbit:ship        ~26,000–38,000
  /orbit:verify      ~20,000–28,000
  /orbit:progress    ~18,000
  /orbit:cost        ~17,000         (this command)
  /orbit:next        ~18,000
  /orbit:debug       ~22,000–35,000  (scales with codebase search)
  /orbit:audit       ~28,000–50,000  (security scan scope)

Note: token counts are (file_bytes / 4) estimates.
      Switch to actual API counts when Claude Code exposes them.
```

### 3. Session Token Log

Run: `node bin/token-log.js --summary` to show entries written this session.

If `.orbit/state/token-log.jsonl` exists and has entries:

```
Session Token Log  (.orbit/state/token-log.jsonl)
──────────────────────────────────────────────────────
  {timestamp}  {command}  in: {N}  out: {N}  total: {N}
  ...
  ─────────────────────────────────────────────────────
  Session total:  in: {N}  out: {N}  combined: {N} tokens
```

If no log entries exist yet:

```
No token log entries yet.
Write entries via: node bin/checkpoint.js --tokens-input N --tokens-output N
```
