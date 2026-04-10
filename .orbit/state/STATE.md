# Orbit Project State
> Persistent release ledger for Orbit's v2.9.0 self-orchestrated milestone. Read before every session and update after meaningful progress.

## Project Vision
Orbit gives AI coding agents a durable operating system for shipping real product work: specialist roles, executable workflows, resumable state, and governance that survives thread switches and long release cycles.

## Project Context
- **Active Milestone**: v2.9.0 — Idea to Market (self-orchestrated by Orbit)
- **Active Phase**: Wave 0 → Wave 1 → Wave 1.5 → Wave 2 → Wave 3 → Wave 0.5 → Wave 4
- **Current Focus**: Wave 4
- **Current Version**: v2.8.1
- **Current Branch**: fix/211-windows-pii-scan
- **Active PR**: not opened yet
- **Directive**: This release is executed by Orbit using its own slash commands. TDD for every agent file. /orbit:review before every PR.
- **Plan**: `docs/plans/v2.9.0-wave-4-ship-positioning.md`

## Phase Status

| Wave | Name | Status | Notes |
|------|------|--------|-------|
| 0 | Release Bootstrap | 🔄 in progress | Prime repo state, document self-orchestration, and keep `/orbit:resume` truthful. |
| 1 | Agent Roster | 🔄 in progress | Core product-lifecycle agents mostly landed; technical-writer remains open on the board. |
| 1.5 | Productization Layer | 🔄 in progress | GTM and specialist-skill follow-through still have open board items. |
| 2 | Safety + Workflow Primitives | ✅ shipped | Clarification gate, loop detection, launch/discover workflows, and decisions log are landed. |
| 3 | Structure + Registry Discipline | 🔄 in progress | Repo cleanup landed; registry consolidation is still open. |
| 0.5 | Foundation Hardening | ✅ shipped | All items complete: event-sourced state, docs index, naming enforcement, plan relocation, enforcement runtime, resume fix. |
| 4 | Ship + Positioning | 🔄 in progress | Wave 0.5 cleared. #206 ✅, #207 ✅, #211 ✅. Open: #208. #79 → v3.0.0, #81 ✅. |

## Decision Ledger
See `.orbit/state/DECISIONS-LOG.md` for the additive decision history.
Use this file to summarize the current release surface, not to duplicate the full log.

## Blockers
```text
[OPEN] B-001 — PR #190 — strict top-level Orbit command dispatch enforcement still in flight
[RESOLVED] B-002 — Wave 4 unblocked: PR #230 merged 2026-04-08, Wave 0.5 complete
[RESOLVED] B-003 — #205 shipped; #79 reassigned to v3.0.0 (not blocking v2.9.0 Wave 4)
```

## Recently Completed (last 5 tasks)
```text
✅ #211 fix(ci): add Windows C:\Users\ path to Sentinel PII scan — fix/211-windows-pii-scan (2026-04-10)
✅ #240 fix(install): symlink specs dir + correct token floor — PR #239 (2026-04-10)
✅ #207 fix(security): flip identity_separation default to true — PR #238 merged 2026-04-09
✅ #234 feat(cost): emit token usage footer after every orbit command — PR #235 merged 2026-04-09
✅ #232 feat(cost): split commands.md into per-command specs + token tracking — PR #233 merged
```

## Todos + Seeds

### v2.9.0 — Idea to Market

#### Wave 0 — Release Bootstrap (CURRENT)
- [ ] #62 — feat(state): initialize v2.9.0 release STATE.md — prime Orbit with full release plan
- [ ] #63 — docs(orbit): add 'Building Orbit with Orbit' self-orchestration playbook

#### Wave 1 — Agent Roster
- [x] #64 — feat(agents): add product-manager agent
- [x] #65 — feat(agents): add business-analyst agent
- [x] #66 — feat(agents): add qa-engineer agent
- [x] #67 — feat(agents): add technical-writer agent

#### Wave 1.5 — Productization Layer
- [ ] #68 — feat(agents): add launch-planner agent (GTM templates, not strategy)
- [x] #69 — refactor(agents): narrow strategist scope — offload PRD/user-story triggers to product-manager
- [ ] #70 — feat(skills): add user-onboarding.md skill
- [ ] #71 — feat(skills): add compliance-checklist.md skill

#### Wave 2 — Safety + Workflow Primitives
- [x] #72 — feat(orchestrator): add loop detection for autonomous mode
- [x] #73 — feat(hooks): add clarification-gate — pause wave on agent ambiguity signal
- [x] #74 — feat(workflows): add /orbit:discover workflow
- [x] #75 — feat(workflows): add /orbit:launch workflow

#### Wave 3 — Structure + Registry Discipline
- [x] #76 — feat(state): add DECISIONS-LOG.md schema for temporal decision tracking
- [x] #77 — fix(orchestrator): add CI=true guard for STATE.md mutex with documentation
- [x] #78 — chore(structure): clean repo root + add GENERATED headers + restructure templates
- [x] #80 — chore(registry): consolidate orbit.registry.json for all v2.9.0 agents/skills/workflows

#### Wave 0.5 — Foundation Hardening (CURRENT)
- [x] #212 — chore(plans): move PHASE-4-PLAN.md to docs/plans/ and rename per artifact-conventions.md
- [x] #213 — feat(state): implement event-sourced state model — typed event log + STATE.md as materialized view
- [x] #214 — feat(docs): create documentation index with reading order and folder contracts
- [x] #215 — feat(ci): add docs artifact naming gate to Sentinel — enforce artifact-conventions.md at commit time (PR #230 merged 2026-04-08)
- [x] #225 — fix(resume): cross-reference GitHub PR state before reporting ship status (PR #226 merged)
- [x] #227 — feat(enforcement): wire Orbit self-enforcement runtime — Waves 1–3 + 5 (PRs #228 + #229 merged)

#### Wave 4 — Ship + Positioning (Audit-Expanded — CURRENT)
- [x] #205 — fix(tests): resolve 2 failing command-runtime assertions — PR isolation + branch-mismatch format
- [x] #206 — feat(security): enforce orbit.config.json schema validation at orchestrator startup (PR #231 merged 2026-04-09)
- [x] #207 — fix(security): flip identity_separation default to true
- [ ] #208 — feat(test): expand vitest coverage surface to safety-evaluator and prompt-dispatch
- [x] #211 — fix(ci): add Windows C:\Users\ path pattern to Sentinel PII scan
- [~] #79 — feat(ci): adopt engineering-standards pipeline.yml — reassigned to v3.0.0 milestone (not v2.9.0)
- [x] #81 — docs(readme): rewrite product positioning for idea-to-market audience
- [~] #232 — feat(cost): split commands.md into per-command specs + token tracking (in progress)

## Seeds (Forward Ideas)
```text
[Post-v2.9.0] Close Issue #181 by making explicit Orbit-command dispatch autonomous across every supported runtime.
[v3.0.0] Expand memory continuity beyond checkpoint manifests into full provenance-driven recovery.
[v3.0.0] #209 — chore(refactor): split eval-runner.js into per-domain modules (1,882 LOC, 5 concerns)
[v3.0.0] #210 — feat(orchestrator): replace .orbit.lock directory mutex with CI-safe distributed locking (WAL strategy)
```

## Open Questions
```text
- #67 (technical-writer) and #81 (README) are closed; #68 (launch-planner) remains open — confirm if still in scope for v2.9.0.
- #79 (CI pipeline) was reassigned to v3.0.0; confirm if v2.9.0 Wave 4 CI hardening is satisfied without it.
- Which final release branch/cut process should own the v2.9.0 ship wave once Wave 0.5 clears?
```
