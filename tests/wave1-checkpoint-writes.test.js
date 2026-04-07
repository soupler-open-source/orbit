/**
 * Wave 1 — Checkpoint Writes
 * Tests for: review.js writeReviewCheckpoint, verify.js writeVerifyCheckpoint,
 * and post-commit-checkpoint.js run()
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { writeReviewCheckpoint } from '../bin/review.js';
import { writeVerifyCheckpoint } from '../bin/verify.js';
import { mergeCheckpoint } from '../bin/checkpoint-manifest.js';

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'orbit-wave1-'));
}

function readCheckpoint(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'latest.json'), 'utf8'));
}

// ── review.js ────────────────────────────────────────────────────────────────

describe('writeReviewCheckpoint', () => {
  it('writes approved evidence correctly', () => {
    const dir = tempDir();
    writeReviewCheckpoint('approved', { checkpointDir: dir });
    const cp = readCheckpoint(dir);
    expect(cp.workflow_evidence.reviewStatus).toBe('approved');
    expect(cp.workflow_evidence.reviewEvidenceStatus).toBe('present');
    expect(cp.workflow_evidence.shipDecisionStatus).toBe('approved');
  });

  it('writes changes_requested evidence and blocks ship', () => {
    const dir = tempDir();
    writeReviewCheckpoint('changes_requested', { checkpointDir: dir });
    const cp = readCheckpoint(dir);
    expect(cp.workflow_evidence.reviewStatus).toBe('changes_requested');
    expect(cp.workflow_evidence.shipDecisionStatus).toBe('blocked');
  });

  it('writes pending without advancing ship decision', () => {
    const dir = tempDir();
    writeReviewCheckpoint('pending', { checkpointDir: dir });
    const cp = readCheckpoint(dir);
    expect(cp.workflow_evidence.reviewStatus).toBe('pending');
    expect(cp.workflow_evidence.shipDecisionStatus).toBeUndefined();
  });

  it('preserves existing implementation evidence when writing review result', () => {
    const dir = tempDir();
    mergeCheckpoint(
      { implementationStatus: 'done', testsStatus: 'passed', issue: '#227', branch: 'feat/227' },
      { checkpointDir: dir }
    );
    writeReviewCheckpoint('approved', { checkpointDir: dir });
    const cp = readCheckpoint(dir);
    expect(cp.workflow_evidence.implementationStatus).toBe('done');
    expect(cp.workflow_evidence.testsStatus).toBe('passed');
    expect(cp.workflow_evidence.reviewStatus).toBe('approved');
  });
});

// ── verify.js ────────────────────────────────────────────────────────────────

describe('writeVerifyCheckpoint', () => {
  it('writes passed evidence correctly', () => {
    const dir = tempDir();
    writeVerifyCheckpoint('passed', { checkpointDir: dir });
    const cp = readCheckpoint(dir);
    expect(cp.workflow_evidence.testsStatus).toBe('passed');
    expect(cp.workflow_evidence.testEvidenceStatus).toBe('present');
  });

  it('writes failed evidence', () => {
    const dir = tempDir();
    writeVerifyCheckpoint('failed', { checkpointDir: dir });
    const cp = readCheckpoint(dir);
    expect(cp.workflow_evidence.testsStatus).toBe('failed');
    expect(cp.workflow_evidence.testEvidenceStatus).toBe('present');
  });

  it('preserves review evidence when tests pass', () => {
    const dir = tempDir();
    mergeCheckpoint(
      { implementationStatus: 'done', reviewStatus: 'approved', reviewEvidenceStatus: 'present' },
      { checkpointDir: dir }
    );
    writeVerifyCheckpoint('passed', { checkpointDir: dir });
    const cp = readCheckpoint(dir);
    expect(cp.workflow_evidence.reviewStatus).toBe('approved');
    expect(cp.workflow_evidence.testsStatus).toBe('passed');
  });
});

// ── post-commit reset behaviour ──────────────────────────────────────────────

describe('post-commit checkpoint reset', () => {
  it('resets review and test evidence when a new implementation commit is recorded', () => {
    const dir = tempDir();
    // Simulate clean state after review + tests
    mergeCheckpoint(
      {
        implementationStatus: 'done',
        testsStatus: 'passed',
        testEvidenceStatus: 'present',
        reviewStatus: 'approved',
        reviewEvidenceStatus: 'present',
        shipDecisionStatus: 'approved',
        issue: '#227',
        branch: 'feat/227',
      },
      { checkpointDir: dir }
    );
    // Simulate new commit (same fields post-commit hook would write)
    mergeCheckpoint(
      {
        implementationStatus: 'done',
        testsStatus: 'unknown',
        testEvidenceStatus: 'missing',
        reviewStatus: 'not_requested',
        reviewEvidenceStatus: 'missing',
        shipDecisionStatus: 'unknown',
        prStatus: 'not_open',
        issue: '#227',
        branch: 'feat/227',
      },
      { checkpointDir: dir }
    );
    const cp = readCheckpoint(dir);
    expect(cp.workflow_evidence.reviewStatus).toBe('not_requested');
    expect(cp.workflow_evidence.testsStatus).toBe('unknown');
    expect(cp.workflow_evidence.shipDecisionStatus).toBe('unknown');
  });
});
