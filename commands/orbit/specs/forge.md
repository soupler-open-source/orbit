# Orbit Command: /orbit:forge <description>

> Build a new specialized agent for a task no current agent covers

## PROCESS

Load `agents/forge.md`. Then:

1. Analyze the task description to identify domain
2. Check if any existing agent covers it (>60% fit?)
3. If no: design new agent using forge blueprint template
4. Write to `agents/{name}.md`
5. Register in CLAUDE.md
6. Dispatch the task to the new agent
7. Confirm agent is working correctly
