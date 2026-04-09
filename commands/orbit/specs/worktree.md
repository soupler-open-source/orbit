# Orbit Command: /orbit:worktree

> Manage git worktrees for parallel wave execution

## PROCESS

Load `skills/git-worktree.md`. Use worktrees when:

- Multiple independent tasks in a wave can run in parallel
- You need isolated environments for each subagent
- Long-running builds should not block the main worktree

Standard worktree workflow:

1. Create a worktree per parallel task: `git worktree add ../orbit-task-N feat/issue-N-slug`
2. Each subagent works in its assigned worktree
3. Commits are made atomically in each worktree
4. After all tasks complete, merge results back to the feature branch
5. Clean up worktrees: `git worktree remove ../orbit-task-N`
