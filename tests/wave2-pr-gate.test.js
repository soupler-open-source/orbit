/**
 * Wave 2 — PR Gate Enforcement
 * Tests for: pull-request-controller workflow gate (checkWorkflowGate)
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Dynamic import so we can pass checkpoint path per test
const { checkWorkflowGate } = await import('../bin/pull-request-controller.js');

function tempCheckpoint(evidence) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orbit-wave2-'));
  const file = path.join(dir, 'latest.json');
  fs.writeFileSync(file, JSON.stringify({ workflow_evidence: evidence }, null, 2));
  return file;
}

describe('checkWorkflowGate', () => {
  it('allows when no checkpoint exists (graceful degradation)', () => {
    const result = checkWorkflowGate('/nonexistent/path/latest.json');
    expect(result.allowed).toBe(true);
    expect(result.warning).toMatch(/no checkpoint/i);
  });

  it('blocks when reviewStatus is not_requested', () => {
    const cp = tempCheckpoint({
      issue: '#227',
      branch: 'feat/227',
      implementationStatus: 'done',
      testsStatus: 'unknown',
      reviewStatus: 'not_requested',
    });
    const result = checkWorkflowGate(cp);
    expect(result.allowed).toBe(false);
    expect(result.message).toMatch(/review has not been run|review required/i);
    expect(result.message).toMatch(/\/orbit:review/i);
  });

  it('blocks when reviewStatus is changes_requested', () => {
    const cp = tempCheckpoint({
      issue: '#227',
      branch: 'feat/227',
      implementationStatus: 'done',
      testsStatus: 'passed',
      reviewStatus: 'changes_requested',
      shipDecisionStatus: 'blocked',
    });
    const result = checkWorkflowGate(cp);
    expect(result.allowed).toBe(false);
    expect(result.message).toMatch(/changes_requested|changes requested/i);
  });

  it('allows when review is approved (even if testsStatus unknown)', () => {
    const cp = tempCheckpoint({
      issue: '#227',
      branch: 'feat/227',
      implementationStatus: 'done',
      testsStatus: 'unknown',
      reviewStatus: 'approved',
      reviewEvidenceStatus: 'present',
      shipDecisionStatus: 'approved',
    });
    const result = checkWorkflowGate(cp);
    expect(result.allowed).toBe(true);
  });

  it('allows when review approved and tests passed (ideal state)', () => {
    const cp = tempCheckpoint({
      issue: '#227',
      branch: 'feat/227',
      implementationStatus: 'done',
      testsStatus: 'passed',
      testEvidenceStatus: 'present',
      reviewStatus: 'approved',
      reviewEvidenceStatus: 'present',
      shipDecisionStatus: 'approved',
      prStatus: 'not_open',
    });
    const result = checkWorkflowGate(cp);
    expect(result.allowed).toBe(true);
  });

  it('allows with warning when checkpoint has no workflow_evidence', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orbit-wave2-empty-'));
    const file = path.join(dir, 'latest.json');
    fs.writeFileSync(file, JSON.stringify({ metadata: { issue: '#227' } }, null, 2));
    const result = checkWorkflowGate(file);
    expect(result.allowed).toBe(true);
    expect(result.warning).toBeDefined();
  });
});
