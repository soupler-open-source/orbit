import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      // Only measure coverage on modules that export testable APIs.
      include: ['bin/orchestrator.js', 'bin/safety-evaluator.js', 'bin/prompt-dispatch.js'],
      reporter: ['text', 'lcov'],
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
      },
    },
  },
});
