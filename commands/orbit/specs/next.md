# Orbit Command: /orbit:next

> Auto-detect current state and recommend the next logical step

## PROCESS

Read STATE.md + ROADMAP.md. Determine:

- No project initialized → run `/orbit:new-project`
- Phase planned but not built → run `/orbit:build N`
- Phase built but not verified → run `/orbit:verify N`
- Phase verified but not shipped → run `/orbit:ship N`
- All phases complete → run `/orbit:milestone`
- Otherwise → show status and ask

The repo-local runtime entrypoint for `/orbit:next` must emit the standard status blocks and the recommended next command. Full automatic dispatch can remain a higher-level workflow concern.

Implementation order:

1. If the current branch is a tracked feature branch with an active issue, derive the next step from live workflow evidence.
2. Otherwise, inspect `.orbit/state/STATE.md` and recommend the next open issue in the active `(CURRENT)` phase section.
3. If no tracked backlog remains, recommend `/orbit:plan`.
4. If no project state exists yet, recommend `/orbit:new-project`.

If open clarification requests exist in `.orbit/state/STATE.md`, do not advance autonomous work until `/orbit:clarify` resolves them.

Special priority rule: when the user asks for the next task and the current branch is already in `review_clean`, `pr_ready`, or `pr_open`, prefer the next unblocked issue from `STATE.md` over staying in the active PR review lane.
