# Orbit Command: /orbit:deploy <env>

> Deploy to a target environment

## PROCESS

Load `skills/deployment.md`. Then:

1. Confirm target environment: staging | production
2. Run pre-deploy checks: tests pass, PR merged, no unresolved CRITICAL findings
3. Deploy using the environment's configured pipeline
4. Run smoke tests post-deploy
5. Update STATE.md with deployment record
6. If smoke tests fail: trigger `/orbit:rollback` automatically
