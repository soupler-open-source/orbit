# Orbit Command: /orbit:debug <issue description>

> Systematic 4-phase root cause debugging

## PROCESS

Load `skills/debugging.md`. Then:

1. Reproduce: write a failing test that captures the bug
2. Isolate: binary search the call stack
3. Root cause: 5 whys analysis
4. Fix: root cause fix + regression test + related code scan
