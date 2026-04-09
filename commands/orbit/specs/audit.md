# Orbit Command: /orbit:audit

> Security + quality deep audit

## PROCESS

1. Spawn reviewer subagent with security focus:
   - OWASP Top 10 scan
   - Dependency vulnerability check
   - Secrets/credentials in codebase check
   - Auth/authz coverage check
2. Output: `SECURITY-AUDIT.md` with findings by severity
