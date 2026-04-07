/**
 * Wave 3 — Review Gate Enforcement
 * Tests for: quick.js review-on-by-default + post-commit workflow guidance
 */
import { describe, it, expect } from 'vitest';
import { runQuick } from '../bin/quick.js';
import { evaluateWorkflowState, formatSummary } from '../bin/workflow-state.js';

// ── quick.js review default ──────────────────────────────────────────────────

describe('quick.js review execution default', () => {
  const baseArgs = {
    issue: '#227',
    branch: 'feat/227-enforcement',
    implementationStatus: 'done',
    testsStatus: 'passed',
    testEvidenceStatus: 'present',
    reviewStatus: 'not_requested',
    prStatus: 'not_open',
  };

  it('executes review by default when tests are green and review not yet run', () => {
    let reviewCalled = false;
    runQuick(baseArgs, {
      reviewRunner: () => {
        reviewCalled = true;
        return { output: 'review ran', reviewStatus: 'approved', reviewEvidenceStatus: 'present', shipDecisionStatus: 'approved' };
      },
    });
    expect(reviewCalled).toBe(true);
  });

  it('skips review when --skip-review true is passed', () => {
    let reviewCalled = false;
    runQuick({ ...baseArgs, skipReview: 'true' }, {
      reviewRunner: () => {
        reviewCalled = true;
        return { output: 'review ran', reviewStatus: 'approved' };
      },
    });
    expect(reviewCalled).toBe(false);
  });

  it('still accepts legacy --execute-review-action true flag', () => {
    let reviewCalled = false;
    runQuick({ ...baseArgs, executeReviewAction: true }, {
      reviewRunner: () => {
        reviewCalled = true;
        return { output: 'review ran', reviewStatus: 'approved' };
      },
    });
    expect(reviewCalled).toBe(true);
  });

  it('does not call review when reviewStatus is already approved', () => {
    let reviewCalled = false;
    runQuick(
      { ...baseArgs, reviewStatus: 'approved', reviewEvidenceStatus: 'present', shipDecisionStatus: 'approved' },
      {
        reviewRunner: () => {
          reviewCalled = true;
          return { output: 'review ran', reviewStatus: 'approved' };
        },
      }
    );
    // autoChain.review won't be auto_dispatch_review because reviewStatus is already approved
    expect(reviewCalled).toBe(false);
  });
});

// ── post-commit workflow guidance ────────────────────────────────────────────

describe('post-commit workflow guidance', () => {
  it('emits review guidance for implementation_done state', () => {
    const evidence = {
      implementationStatus: 'done',
      testsStatus: 'unknown',
      reviewStatus: 'not_requested',
      branch: 'feat/227',
      issue: '#227',
    };
    const workflow = evaluateWorkflowState(evidence);
    const summary = formatSummary(workflow);
    expect(summary).toContain('Workflow Gate');
    expect(summary).toContain('State:');
    expect(summary).toContain('Next:');
    expect(summary).toContain('Command:');
  });

  it('evaluateWorkflowState correctly identifies implementation_done after commit reset', () => {
    const evidence = {
      implementationStatus: 'done',
      testsStatus: 'unknown',
      reviewStatus: 'not_requested',
      reviewEvidenceStatus: 'missing',
      branch: 'feat/227',
      issue: '#227',
    };
    const workflow = evaluateWorkflowState(evidence);
    expect(workflow.state).toBe('implementation_done');
    expect(workflow.nextCommand).toContain('/orbit:quick');
  });
});
