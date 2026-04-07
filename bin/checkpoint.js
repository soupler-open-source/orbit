#!/usr/bin/env node
/**
 * /orbit:checkpoint — explicit session save-point.
 *
 * Writes current in-session progress to:
 *   1. .orbit/state/checkpoints/latest.json  (workflow_evidence)
 *   2. .orbit/state/STATE.md                 (via sync-context.sh)
 *   3. context.db                            (via sync-context.sh)
 *
 * Use before closing a terminal intentionally, before switching context,
 * or before a long-running operation.
 *
 * Usage:
 *   node bin/checkpoint.js [--review-status <approved|changes_requested>]
 *                          [--tests-status <passed|failed>]
 *                          [--pr-status <open|merged|not_open>]
 *                          [--issue <#NNN>]
 */

'use strict';

const { execFileSync } = require('child_process');
const path = require('path');
const { mergeCheckpoint } = require('./checkpoint-manifest');
const { inferIssueFromBranch, isFeatureBranch } = require('./workflow-state');

const ROOT = path.resolve(__dirname, '..');

function safeExec(args) {
  try {
    return execFileSync(args[0], args.slice(1), {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (_) {
    return '';
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i++;
  }
  return args;
}

function run(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const branch = safeExec(['git', 'rev-parse', '--abbrev-ref', 'HEAD']);
  const headSha = safeExec(['git', 'rev-parse', '--short', 'HEAD']);
  const issue = args.issue || (isFeatureBranch(branch) ? inferIssueFromBranch(branch) : null);

  const fields = {
    ...(issue ? { issue } : {}),
    ...(branch ? { branch } : {}),
    ...(headSha ? { headSha } : {}),
    implementationStatus: 'done',
  };

  if (args['review-status']) fields.reviewStatus = args['review-status'];
  if (args['tests-status']) fields.testsStatus = args['tests-status'];
  if (args['pr-status']) fields.prStatus = args['pr-status'];

  const result = mergeCheckpoint(fields);

  process.stdout.write('━━━ Orbit Checkpoint ━━━━━━━━━━━━━━━━━━\n');
  process.stdout.write(`  Branch:   ${branch || 'unknown'}\n`);
  process.stdout.write(`  Issue:    ${issue || 'untracked'}\n`);
  process.stdout.write(`  Head SHA: ${headSha || 'unknown'}\n`);
  process.stdout.write(`  State:    ${JSON.stringify(result.workflow_evidence)}\n`);
  process.stdout.write('  Written:  .orbit/state/checkpoints/latest.json\n');
  process.stdout.write('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Sync context.db and STATE.md
  try {
    execFileSync(path.join(ROOT, 'hooks/scripts/sync-context.sh'), [], {
      cwd: ROOT,
      stdio: 'inherit',
    });
  } catch (_) {
    // non-fatal
  }

  return result;
}

if (require.main === module) {
  run();
}

module.exports = { run };
