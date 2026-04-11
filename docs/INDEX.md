# Orbit Documentation Index

> Single entry point for all Orbit documentation. Start here before reading anything else.

## Reading Paths by Audience

| Audience | Start here | Then read |
|----------|-----------|-----------|
| **New contributor** | [`docs/architecture/overview.md`](architecture/overview.md) | [`core-concepts.md`](architecture/core-concepts.md) → [`docs/governance/contributing.md`](governance/contributing.md) → [`docs/playbooks/self-orchestration.md`](playbooks/self-orchestration.md) |
| **Operator** (using Orbit on a project) | [`README.md`](../README.md) | [`core-concepts.md`](architecture/core-concepts.md) → [`token-optimization.md`](architecture/token-optimization.md) → [`docs/operations/error-codes.md`](operations/error-codes.md) |
| **Evaluator** (assessing Orbit quality) | [`docs/quality/evaluation-framework.md`](quality/evaluation-framework.md) | [`eval-dataset.md`](quality/eval-dataset.md) → [`security-model.md`](architecture/security-model.md) |
| **Security reviewer** | [`SECURITY.md`](../SECURITY.md) | [`docs/architecture/security-model.md`](architecture/security-model.md) → [`docs/operations/error-codes.md`](operations/error-codes.md) |
| **DevOps / CI** | [`docs/architecture/overview.md`](architecture/overview.md) (Sentinel CI section) | [`docs/operations/playbooks.md`](operations/playbooks.md) |

## Canonical Architecture Reading Order

For the common "understand the system" path, read in this order:

1. [`docs/architecture/overview.md`](architecture/overview.md) — what Orbit is and how it's structured
2. [`docs/architecture/core-concepts.md`](architecture/core-concepts.md) — agents, skills, STATE.md, hooks, forge
3. [`docs/architecture/runtime-adapters.md`](architecture/runtime-adapters.md) — Claude vs Codex vs Antigravity
4. [`docs/architecture/security-model.md`](architecture/security-model.md) — threat model, hook safety
5. [`docs/architecture/token-optimization.md`](architecture/token-optimization.md) — cost discipline

## Folder Contracts

What each folder is — and is not — for.

| Folder | Contains | Does NOT contain |
|--------|----------|-----------------|
| `architecture/` | Stable canonical system design, component relationships, security model, token strategy | Per-release notes, runbooks, implementation plans |
| `operations/` | Error codes, runbooks, playbooks for operators | Architecture decisions, release notes, plans |
| `quality/` | Eval framework, eval dataset, quality gate specs | Implementation plans, architecture docs |
| `plans/` | Active and historical wave/milestone implementation plans | Stable architecture docs, runbooks |
| `issues/` | Durable design notes for specific GitHub issues that need repo-local context | Everything else |
| `standards/` | Meta-rules: naming conventions, artifact metadata, governance | Architecture, operations, plans |
| `governance/` | Contributing guide, code of conduct, community rules | Technical content, architecture |
| `releases/` | Release notes, checklists, retrospectives | Architecture decisions, implementation plans |
| `playbooks/` | Self-orchestration guide, how-to guides for specific workflows | Reference architecture |
| `integrations/` | External integration guides (MCP, IDE extensions) | Core architecture, governance |

## Naming and Metadata Standards

All artifact naming, versioning, and folder placement rules are defined in [`docs/standards/artifact-conventions.md`](standards/artifact-conventions.md).
