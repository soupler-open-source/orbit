#!/usr/bin/env node
/**
 * post-commit-checkpoint.js
 *
 * Called by hooks/scripts/post-commit.sh after every successful commit.
 * Writes/merges implementation evidence into .orbit/state/checkpoints/latest.json
 * so that workflow gates (pre-tool-use, PR controller) have real state to evaluate.
 *
 * Resets testsStatus and reviewStatus on every implementation commit — a new commit
 * means previous test/review evidence is stale and must be re-established.
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

function run() {
  const branch = safeExec(['git', 'rev-parse', '--abbrev-ref', 'HEAD']);
  const headSha = safeExec(['git', 'rev-parse', '--short', 'HEAD']);

  if (!isFeatureBranch(branch)) {
    // On develop/main — no workflow checkpoint needed
    return;
  }

  const issue = inferIssueFromBranch(branch);

  mergeCheckpoint({
    issue: issue || null,
    branch,
    headSha,
    implementationStatus: 'done',
    // Reset test and review evidence — new commit invalidates prior evidence
    testsStatus: 'unknown',
    reviewStatus: 'not_requested',
    reviewEvidenceStatus: 'missing',
    testEvidenceStatus: 'missing',
    shipDecisionStatus: 'unknown',
    prStatus: 'not_open',
  });
}

if (require.main === module) {
  try {
    run();
  } catch (error) {
    // Non-fatal — never block a commit due to checkpoint errors
    process.stderr.write(`[orbit/checkpoint] warning: ${error.message}\n`);
  }
}

module.exports = { run };
