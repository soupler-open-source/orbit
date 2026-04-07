import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildCheckpointManifest,
  mergeCheckpoint,
  writeCheckpointManifest,
} from '../bin/checkpoint-manifest.js';

describe('checkpoint manifest', () => {
  it('builds the expected manifest shape and writes latest plus history entries', () => {
    const checkpointDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orbit-checkpoint-'));
    const manifest = buildCheckpointManifest({
      args: {
        issue: '#181',
        branch: 'feat/181-quick-review-pr-autochain',
        headSha: 'abc1234',
        changedFiles:
          'bin/runtime-command.js,tests/command-runtime.test.js,docs/quality/evaluation-framework.md,orbit.registry.json',
        verificationChecks: 'vitest:true,validate:true',
        requiredContext: 'PR_DESCRIPTION,TEST_LOGS',
      },
      profile: {
        command: '/orbit:quick',
        defaultPrimary: '/orbit:ship',
      },
      evidence: {
        issue: '#181',
        branch: 'feat/181-quick-review-pr-autochain',
        reviewFindings: 'MEDIUM: persist findings into remediation state',
      },
      workflow: {
        state: 'pr_ready',
        nextCommand: '/orbit:ship',
        blockers: [],
      },
    });

    expect(manifest.metadata.issue).toBe('#181');
    expect(manifest.metadata.pr).toBe(null);
    expect(manifest.impact.scope).toEqual({
      logic: true,
      tests: true,
      docs: true,
      config: true,
    });
    expect(manifest.orchestration.current_state).toBe('pr_ready');
    expect(manifest.orchestration.recommended_next_step).toBe('/orbit:ship');
    expect(manifest.orchestration.review_findings).toBe(
      'MEDIUM: persist findings into remediation state'
    );
    expect(manifest.verification_summary.status).toBe('success');
    expect(manifest.verification_summary.checks).toEqual([
      { name: 'vitest', passed: true },
      { name: 'validate', passed: true },
    ]);

    const written = writeCheckpointManifest({
      checkpointDir,
      manifest,
      timestamp: '2026-04-01T00:00:00.000Z',
    });
    expect(fs.existsSync(written.latestPath)).toBe(true);
    expect(fs.existsSync(written.historyPath)).toBe(true);

    const latest = JSON.parse(fs.readFileSync(written.latestPath, 'utf8'));
    expect(latest.metadata.issue).toBe('#181');
    expect(latest.checkpoint).toBe('pr_ready');
  });

  it('mergeCheckpoint creates workflow_evidence when no checkpoint exists', () => {
    const checkpointDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orbit-checkpoint-merge-'));
    const result = mergeCheckpoint(
      { implementationStatus: 'done', testsStatus: 'unknown', reviewStatus: 'not_requested' },
      { checkpointDir }
    );
    expect(result.workflow_evidence.implementationStatus).toBe('done');
    expect(result.workflow_evidence.reviewStatus).toBe('not_requested');
    const written = JSON.parse(
      fs.readFileSync(path.join(checkpointDir, 'latest.json'), 'utf8')
    );
    expect(written.workflow_evidence.implementationStatus).toBe('done');
  });

  it('mergeCheckpoint preserves existing fields not in new update', () => {
    const checkpointDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orbit-checkpoint-merge2-'));
    mergeCheckpoint(
      { implementationStatus: 'done', testsStatus: 'passed', reviewStatus: 'not_requested', issue: '#227', branch: 'feat/227' },
      { checkpointDir }
    );
    mergeCheckpoint(
      { reviewStatus: 'approved', reviewEvidenceStatus: 'present', shipDecisionStatus: 'approved' },
      { checkpointDir }
    );
    const written = JSON.parse(
      fs.readFileSync(path.join(checkpointDir, 'latest.json'), 'utf8')
    );
    expect(written.workflow_evidence.implementationStatus).toBe('done');
    expect(written.workflow_evidence.testsStatus).toBe('passed');
    expect(written.workflow_evidence.reviewStatus).toBe('approved');
    expect(written.workflow_evidence.reviewEvidenceStatus).toBe('present');
  });

  it('mergeCheckpoint resets review and test evidence on new implementation commit', () => {
    const checkpointDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orbit-checkpoint-reset-'));
    // Simulate: review was clean
    mergeCheckpoint(
      { implementationStatus: 'done', testsStatus: 'passed', reviewStatus: 'approved', reviewEvidenceStatus: 'present' },
      { checkpointDir }
    );
    // Simulate: new commit (implementation changed)
    mergeCheckpoint(
      { implementationStatus: 'done', testsStatus: 'unknown', reviewStatus: 'not_requested', reviewEvidenceStatus: 'missing' },
      { checkpointDir }
    );
    const written = JSON.parse(
      fs.readFileSync(path.join(checkpointDir, 'latest.json'), 'utf8')
    );
    expect(written.workflow_evidence.reviewStatus).toBe('not_requested');
    expect(written.workflow_evidence.testsStatus).toBe('unknown');
  });

  it('treats command markdown as docs impact', () => {
    const manifest = buildCheckpointManifest({
      args: {
        issue: '#181',
        branch: 'feat/181-quick-review-pr-autochain',
        headSha: 'abc1234',
        changedFiles: 'commands/commands.md',
      },
      profile: {
        command: '/orbit:quick',
      },
      evidence: {
        issue: '#181',
        branch: 'feat/181-quick-review-pr-autochain',
      },
      workflow: {
        state: 'implementation_done',
        nextCommand: '/orbit:review',
        blockers: [],
      },
    });

    expect(manifest.impact.scope.docs).toBe(true);
  });
});
