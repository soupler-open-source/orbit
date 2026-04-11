# Orbit Command: /orbit:quick <task description>

> Ad-hoc task with Orbit quality guarantees, no full planning

## PROCESS

For Orbit framework work, `/orbit:quick` is the default entrypoint. Do not start freeform implementation on `develop` for work that should be tracked as an Orbit task.

If the user gives a plain prompt that implies a tracked implementation task, Orbit should implicitly route it here and say so in the classification block.

**Emit at start (classification block):**

```
━━━ Orbit ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Domain:     {ENGINEERING|PRODUCT|DESIGN|OPERATIONS|RESEARCH|REVIEW|SYNTHESIS}
  Complexity: QUICK
  Agent:      {selected agent}
  Mode:       {COLLABORATIVE|AUTONOMOUS}
  Working target: {Issue #{NNN}|untracked task}
  Branch:     {branch name}
  PR:         {#NNN|not opened yet}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

1. Classify: which agent handles this?
2. Confirm issue + branch discipline before edits:
   - identify the issue number or create one if missing
   - ensure work is on a feature branch from freshly pulled `develop`
   - keep scope limited to that issue
   - if the requested issue does not match the active feature-branch issue, stop and switch context before continuing
3. Define single XML task:
   ```xml
   <task type="...">
     <n>...</n>
     <files>...</files>
     <action>...</action>
     <verify>...</verify>
     <done>...</done>
   </task>
   ```
4. Execute with relevant skill loaded
5. Verify and commit the implementation atomically. Then commit the STATE.md sync as a **separate** follow-up commit immediately after. Both commits must land before the PR controller is invoked.
6. Write the checkpoint manifest: `node bin/checkpoint.js --review-status approved --tests-status passed --issue "#N"`
7. If the task is review-ready, push the branch and open/refresh the PR using the controller CLI — never bare `gh pr create`. Run this as the **last step**, after all commits including STATE.md sync are pushed:
   ```
   node bin/pull-request-controller.js \
     --issue "#N" --branch "<branch>" --title "<title>" \
     --commands "<cmd1> || <cmd2>"
   ```
8. Before requesting review or ship progression, refresh the PR body evidence:
   - `## Test plan` lists the commands actually run
   - `Orbit Self-Review` records the review command, dispatched agents, ship decision, and findings handled

**After completion, emit the checkpoint block and next step:**

```
━━━ Orbit Auto-Chain ━━━━━━━━━━━━━━━━━
  Verification: {passed|failed|required|in_progress|waiting_on_implementation}
  Review:       {auto_dispatch_review|dispatched_pending|clean|changes_requested|waiting_on_verification}
  PR Action:    {blocked|create_or_update_ready|update_existing_pr|created|updated}
  Final State:  {implementation_done|review_required|remediation_required|pr_ready|pr_open}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━ Orbit Checkpoint ━━━━━━━━━━━━━━━━━━
  Checkpoint: {implementation_complete|review_required|remediation_required|review_clean|pr_ready|pr_open}
  Artifact:   .orbit/state/checkpoints/latest.json
  Verification: {success|failed}
  Next:       {/orbit:review|/orbit:ship|/orbit:progress}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The auto-chain block rules:
- if verification is green, advance into review handling instead of stopping at implementation prose
- if review is clean, the chained final state must reach `pr_ready` or `pr_open`
- if review is clean and PR metadata is available, create or refresh the PR automatically
- if review requests changes, route back into `remediation_required`
- if review or evidence is not clean, PR action stays blocked

```
---
**What's next**: /orbit:quick #NNN — {next unblocked issue title}
**Why**: {one sentence — current milestone state + why this is next}
```
