#!/usr/bin/env node
'use strict';

// Orbit — npm run help
// Prints all available npm scripts grouped by category with descriptions.

const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;

const GROUPS = [
  {
    name: 'Setup & Installation',
    scripts: [
      ['setup', 'Bootstrap the framework and initialise project state'],
      ['install-local', 'Install Orbit locally for the current project (Claude)'],
      ['install-global', 'Install Orbit globally for a single tool (Claude)'],
      ['install-all', 'Install Orbit globally for all supported tools'],
      ['bootstrap', 'Reconstruct project state from STATE.md into context.db'],
    ],
  },
  {
    name: 'Context & State',
    scripts: [
      ['context', 'Manage context.db  (--load minimal|standard|full|decisions|blocked  |  --save)'],
      ['nexus-init', 'Initialise Nexus multi-repo orchestration'],
      ['nexus-sync', 'Sync Nexus state across repos'],
    ],
  },
  {
    name: 'Code Quality',
    scripts: [
      ['lint', 'Run ESLint across bin/'],
      ['lint:fix', 'Run ESLint with auto-fix'],
      ['format:check', 'Check Prettier formatting in bin/'],
      ['format:write', 'Auto-fix Prettier formatting in bin/'],
      ['test', 'Run unit tests (vitest)'],
      ['test:watch', 'Run tests in watch mode'],
      ['test:coverage', 'Run tests and enforce ≥60 % coverage gate'],
    ],
  },
  {
    name: 'Validation & Evaluation',
    scripts: [
      ['validate', 'Run framework integrity checks (bin/validate.sh)'],
      ['eval', 'Run SOTA compliance evaluation (bin/eval.sh)'],
    ],
  },
  {
    name: 'Generation',
    scripts: [
      ['generate', 'Regenerate .claude/CLAUDE.md from orbit.registry.json'],
      ['generate:views', 'Regenerate INSTRUCTIONS.md, SKILLS.md, WORKFLOWS.md'],
      ['generate:plans', 'Regenerate docs/plans/README.md execution-order index'],
    ],
  },
  {
    name: 'Publishing',
    scripts: [['promote', 'Promote local patterns / agents to Orbit Core']],
  },
];

function printHelp() {
  const pkg = require('../package.json');
  process.stdout.write(`\n${bold(`Orbit Framework`)}  ${dim(`v${pkg.version}`)}\n`);
  process.stdout.write(`${dim(pkg.description)}\n\n`);
  process.stdout.write(`${bold('Usage:')}  npm run ${cyan('<script>')}  [-- <args>]\n\n`);

  for (const group of GROUPS) {
    process.stdout.write(`${bold(group.name)}\n`);
    for (const [name, desc] of group.scripts) {
      const pad = 22;
      const paddedName = cyan(name.padEnd(pad));
      process.stdout.write(`  ${paddedName}${dim(desc)}\n`);
    }
    process.stdout.write('\n');
  }

  process.stdout.write(
    `${dim('Tip: pass --context minimal|standard|full to npm run context for tiered loads.')}\n\n`
  );
}

printHelp();
