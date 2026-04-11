#!/usr/bin/env node
'use strict';

const { buildRuntimeCommandOutput, parseArgs } = require('./runtime-command');
const { mergeCheckpoint } = require('./checkpoint-manifest');

function renderReview(args = {}) {
  return buildRuntimeCommandOutput(args, {
    command: '/orbit:review',
    domain: 'REVIEW',
    complexity: 'TASK',
    agent: 'reviewer',
    progressAgent: 'reviewer',
    defaultPrimary: '/orbit:ship',
    defaultWhy: 'Review should resolve into either blocked findings or ship readiness.',
    details: 'branch review',
  });
}

/**
 * Record the outcome of a review run into the checkpoint manifest.
 * Called after /orbit:review completes with a known result.
 *
 * reviewStatus: 'approved' | 'changes_requested' | 'pending'
 */
function writeReviewCheckpoint(reviewStatus, options = {}) {
  if (reviewStatus === 'approved') {
    return mergeCheckpoint(
      {
        reviewStatus: 'approved',
        reviewEvidenceStatus: 'present',
        shipDecisionStatus: 'approved',
      },
      options
    );
  }
  if (reviewStatus === 'changes_requested') {
    return mergeCheckpoint(
      {
        reviewStatus: 'changes_requested',
        reviewEvidenceStatus: 'present',
        shipDecisionStatus: 'blocked',
      },
      options
    );
  }
  // pending or unknown — record state without advancing
  return mergeCheckpoint({ reviewStatus: reviewStatus || 'pending' }, options);
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  if (args['review-status']) {
    writeReviewCheckpoint(args['review-status']);
  }
  process.stdout.write(renderReview(args) + '\n');
}

module.exports = {
  renderReview,
  writeReviewCheckpoint,
};
