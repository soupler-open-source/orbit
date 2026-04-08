import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  checkFrontmatter,
  checkNoStatePlans,
  checkPlanNaming,
  checkRootMarkdown,
  hasFrontmatter,
  validate,
} from '../bin/validate-doc-naming.js';

// ── Rule 1: plan naming ───────────────────────────────────────────────────────

describe('checkPlanNaming', () => {
  it('passes valid milestone plan name', () => {
    expect(checkPlanNaming('docs/plans/v2.9.0-wave-4-ship-positioning.md')).toEqual([]);
  });
  it('passes valid issue plan name', () => {
    expect(checkPlanNaming('docs/plans/issue-227-self-enforcement-runtime.md')).toEqual([]);
  });
  it('passes README.md index file in docs/plans/', () => {
    expect(checkPlanNaming('docs/plans/README.md')).toEqual([]);
  });
  it('rejects PHASE-4-PLAN.md (uppercase, wrong pattern)', () => {
    const errors = checkPlanNaming('docs/plans/PHASE-4-PLAN.md');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('ERR-ORBIT-DOCS-001');
    expect(errors[0].file).toBe('docs/plans/PHASE-4-PLAN.md');
  });
  it('rejects plan-final.md (no version or issue prefix)', () => {
    expect(checkPlanNaming('docs/plans/plan-final.md')).toHaveLength(1);
  });
  it('rejects my-plan.md', () => {
    expect(checkPlanNaming('docs/plans/my-plan.md')).toHaveLength(1);
  });
  it('ignores files not in docs/plans/', () => {
    expect(checkPlanNaming('docs/architecture/ARCH.md')).toEqual([]);
    expect(checkPlanNaming('bin/something.md')).toEqual([]);
    expect(checkPlanNaming('README.md')).toEqual([]);
  });
});

// ── Rule 2: no plan files in .orbit/state/plans/ ─────────────────────────────

describe('checkNoStatePlans', () => {
  it('rejects any .md in .orbit/state/plans/', () => {
    const errors = checkNoStatePlans('.orbit/state/plans/PHASE-4-PLAN.md');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('ERR-ORBIT-DOCS-002');
  });
  it('ignores .orbit/state/ files outside plans/', () => {
    expect(checkNoStatePlans('.orbit/state/STATE.md')).toEqual([]);
    expect(checkNoStatePlans('.orbit/state/checkpoints/latest.json')).toEqual([]);
    expect(checkNoStatePlans('.orbit/state/DECISIONS-LOG.md')).toEqual([]);
  });
  it('ignores non-md files in .orbit/state/plans/', () => {
    expect(checkNoStatePlans('.orbit/state/plans/something.json')).toEqual([]);
  });
});

// ── Rule 3: no undocumented root-level markdown ───────────────────────────────

describe('checkRootMarkdown', () => {
  it('rejects unknown root-level markdown', () => {
    const errors = checkRootMarkdown('my-notes.md');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('ERR-ORBIT-DOCS-003');
  });
  it('allows all approved root markdown files', () => {
    for (const f of [
      'README.md',
      'CHANGELOG.md',
      'SECURITY.md',
      'CLAUDE.md',
      'INSTRUCTIONS.md',
      'SKILLS.md',
      'WORKFLOWS.md',
    ]) {
      expect(checkRootMarkdown(f), f).toEqual([]);
    }
  });
  it('ignores non-markdown root files', () => {
    expect(checkRootMarkdown('package.json')).toEqual([]);
    expect(checkRootMarkdown('.gitignore')).toEqual([]);
  });
  it('ignores markdown in subdirectories', () => {
    expect(checkRootMarkdown('docs/something.md')).toEqual([]);
    expect(checkRootMarkdown('bin/something.md')).toEqual([]);
  });
});

// ── Rule 4: frontmatter on architecture/ and standards/ ──────────────────────

describe('hasFrontmatter', () => {
  it('detects valid frontmatter with all required fields', () => {
    const content = [
      '---',
      'id: foo',
      'doc_type: standard',
      'status: Active',
      'version: v1',
      'last_updated: 2026-04-08',
      '---',
      '',
      '# Doc',
    ].join('\n') + '\n';
    expect(hasFrontmatter(content)).toBe(true);
  });

  it('rejects frontmatter missing last_updated', () => {
    const content = [
      '---',
      'id: foo',
      'doc_type: standard',
      'status: Active',
      'version: v1',
      '---',
      '',
      '# Doc',
    ].join('\n') + '\n';
    expect(hasFrontmatter(content)).toBe(false);
  });

  it('rejects files with no frontmatter', () => {
    expect(hasFrontmatter('# Just a heading\n\nContent')).toBe(false);
  });

  it('rejects malformed frontmatter (no closing ---)', () => {
    expect(hasFrontmatter('---\nid: foo\n')).toBe(false);
  });
});

describe('checkFrontmatter', () => {
  it('passes a docs/architecture/ file with valid frontmatter', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orbit-docnaming-'));
    fs.mkdirSync(path.join(dir, 'docs', 'architecture'), { recursive: true });
    const file = 'docs/architecture/ARCH.md';
    fs.writeFileSync(
      path.join(dir, file),
      '---\nid: arch\ndoc_type: architecture\nstatus: Active\nversion: v1\nlast_updated: 2026-04-08\n---\n\n# Arch\n'
    );
    expect(checkFrontmatter(file, dir)).toEqual([]);
  });

  it('fails a docs/standards/ file missing frontmatter', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orbit-docnaming-'));
    fs.mkdirSync(path.join(dir, 'docs', 'standards'), { recursive: true });
    const file = 'docs/standards/naming.md';
    fs.writeFileSync(path.join(dir, file), '# Naming\n\nNo frontmatter here.\n');
    const errors = checkFrontmatter(file, dir);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('ERR-ORBIT-DOCS-004');
  });

  it('ignores files outside governed directories', () => {
    expect(checkFrontmatter('docs/plans/issue-215-foo.md', '/')).toEqual([]);
    expect(checkFrontmatter('docs/releases/v2.9.0.md', '/')).toEqual([]);
  });

  it('ignores non-md files in governed directories', () => {
    expect(checkFrontmatter('docs/architecture/diagram.png', '/')).toEqual([]);
  });
});

// ── Integration ───────────────────────────────────────────────────────────────

describe('validate (integration)', () => {
  it('returns no errors for non-governed files', () => {
    expect(validate(['bin/something.js', 'tests/foo.test.js', 'package.json'])).toEqual([]);
  });

  it('catches plan naming violation', () => {
    const errors = validate(['docs/plans/PHASE-4-PLAN.md']);
    expect(errors.some((e) => e.code === 'ERR-ORBIT-DOCS-001')).toBe(true);
  });

  it('catches .orbit/state/plans violation', () => {
    const errors = validate(['.orbit/state/plans/something.md']);
    expect(errors.some((e) => e.code === 'ERR-ORBIT-DOCS-002')).toBe(true);
  });

  it('catches root markdown violation', () => {
    const errors = validate(['SCRATCH.md']);
    expect(errors.some((e) => e.code === 'ERR-ORBIT-DOCS-003')).toBe(true);
  });

  it('passes valid plan filenames', () => {
    expect(validate(['docs/plans/v2.9.0-wave-4-ship-positioning.md'])).toEqual([]);
    expect(validate(['docs/plans/issue-215-docs-naming-gate.md'])).toEqual([]);
  });

  it('passes multiple valid files together', () => {
    expect(
      validate([
        'docs/plans/issue-215-docs-naming-gate.md',
        'bin/validate-doc-naming.js',
        'tests/validate-doc-naming.test.js',
        'README.md',
      ])
    ).toEqual([]);
  });
});
