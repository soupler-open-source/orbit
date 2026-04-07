#!/usr/bin/env node
'use strict';

const { buildRuntimeCommandOutput, parseArgs } = require('./runtime-command');
const { mergeCheckpoint } = require('./checkpoint-manifest');

function renderVerify(args = {}) {
  return buildRuntimeCommandOutput(args, {
    command: '/orbit:verify',
    domain: 'QUALITY',
    complexity: 'PHASE',
    agent: 'reviewer + engineer',
    progressAgent: 'reviewer',
    defaultPrimary: '/orbit:ship',
    defaultWhy: 'Verification should lead into ship only after evidence is green.',
    details: 'verification phase',
  });
}

/**
 * Record the outcome of a verification/test run into the checkpoint manifest.
 * Called after tests complete with a known result.
 *
 * testsStatus: 'passed' | 'failed'
 */
function writeVerifyCheckpoint(testsStatus, options = {}) {
  if (testsStatus === 'passed') {
    return mergeCheckpoint(
      {
        testsStatus: 'passed',
        testEvidenceStatus: 'present',
      },
      options
    );
  }
  if (testsStatus === 'failed') {
    return mergeCheckpoint(
      {
        testsStatus: 'failed',
        testEvidenceStatus: 'present',
      },
      options
    );
  }
  return mergeCheckpoint({ testsStatus: testsStatus || 'unknown' }, options);
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  if (args['tests-status']) {
    writeVerifyCheckpoint(args['tests-status']);
  }
  process.stdout.write(renderVerify(args) + '\n');
}

module.exports = {
  renderVerify,
  writeVerifyCheckpoint,
};
