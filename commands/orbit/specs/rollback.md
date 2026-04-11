# Orbit Command: /orbit:rollback

> Revert the last deployment

## PROCESS

Load `skills/deployment.md`. Then:

1. Identify the last deployed version from STATE.md
2. Confirm with operator before executing rollback
3. Execute rollback to the previous stable version
4. Verify service health post-rollback
5. Record rollback event and reason in STATE.md and DECISIONS-LOG.md
6. Create a follow-up issue to investigate the root cause of the failed deployment
