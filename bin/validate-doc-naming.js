#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// ── Rule 1: Plan naming ───────────────────────────────────────────────────────

const PLAN_DIR = 'docs/plans/';
const VALID_PLAN_RE = /^(v\d+\.\d+\.\d+-wave-\d+-.+|issue-\d+-.+)\.md$/;

function checkPlanNaming(file) {
  if (!file.startsWith(PLAN_DIR)) return [];
  const basename = path.basename(file);
  if (basename === 'README.md') return [];
  if (VALID_PLAN_RE.test(basename)) return [];
  return [
    {
      code: 'ERR-ORBIT-DOCS-001',
      file,
      message: `Plan file name does not match required pattern (v<x>.<y>.<z>-wave-<n>-<slug>.md or issue-<nnn>-<slug>.md): ${basename}`,
    },
  ];
}

// ── Rule 2: No plan files in .orbit/state/plans/ ─────────────────────────────

const STATE_PLANS_RE = /^\.orbit\/state\/plans\/.+\.md$/;

function checkNoStatePlans(file) {
  if (STATE_PLANS_RE.test(file)) {
    return [
      {
        code: 'ERR-ORBIT-DOCS-002',
        file,
        message: `Plan files must not be stored in .orbit/state/plans/ — use docs/plans/ instead: ${file}`,
      },
    ];
  }
  return [];
}

// ── Rule 3: Root-level markdown ───────────────────────────────────────────────

const ALLOWED_ROOT_MD = new Set([
  'README.md',
  'CHANGELOG.md',
  'SECURITY.md',
  'CLAUDE.md',
  'INSTRUCTIONS.md',
  'SKILLS.md',
  'WORKFLOWS.md',
]);

function checkRootMarkdown(file) {
  if (!file.endsWith('.md')) return [];
  if (file.includes('/')) return [];
  if (ALLOWED_ROOT_MD.has(file)) return [];
  return [
    {
      code: 'ERR-ORBIT-DOCS-003',
      file,
      message: `Root-level markdown file not in approved list: ${file}`,
    },
  ];
}

// ── Rule 4: Frontmatter on architecture/ and standards/ ──────────────────────

const REQUIRED_FRONTMATTER_FIELDS = ['id', 'doc_type', 'status', 'version', 'last_updated'];
const GOVERNED_DIRS = ['docs/architecture/', 'docs/standards/'];

function hasFrontmatter(content) {
  const match = String(content || '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return false;
  const block = match[1];
  return REQUIRED_FRONTMATTER_FIELDS.every((field) => new RegExp(`^${field}:`, 'm').test(block));
}

function checkFrontmatter(file, cwd = process.cwd()) {
  if (!file.endsWith('.md')) return [];
  const governed = GOVERNED_DIRS.some((dir) => file.startsWith(dir));
  if (!governed) return [];
  const absPath = path.join(cwd, file);
  let content;
  try {
    content = fs.readFileSync(absPath, 'utf8');
  } catch (_) {
    return [];
  }
  if (hasFrontmatter(content)) return [];
  return [
    {
      code: 'ERR-ORBIT-DOCS-004',
      file,
      message: `Missing required frontmatter (id, doc_type, status, version, last_updated) in ${file}`,
    },
  ];
}

// ── Integration ───────────────────────────────────────────────────────────────

function validate(files, cwd = process.cwd()) {
  const errors = [];
  for (const file of files) {
    errors.push(...checkPlanNaming(file));
    errors.push(...checkNoStatePlans(file));
    errors.push(...checkRootMarkdown(file));
    errors.push(...checkFrontmatter(file, cwd));
  }
  return errors;
}

// ── CLI ───────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith('--')) continue;
    args[key.slice(2)] = value;
    i++;
  }
  return args;
}

function main(argv) {
  const args = parseArgs(argv);
  const changedFilesFile = args['changed-files-file'];
  if (!changedFilesFile) {
    process.stderr.write('Usage: validate-doc-naming.js --changed-files-file <path>\n');
    process.exit(1);
  }
  const text = fs.readFileSync(path.resolve(changedFilesFile), 'utf8');
  const files = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const errors = validate(files);
  if (errors.length === 0) {
    process.stdout.write('✅ Doc naming gate: all files pass.\n');
    process.exit(0);
  }
  for (const e of errors) {
    process.stderr.write(`[${e.code}] ${e.file}: ${e.message}\n`);
  }
  process.exit(1);
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = {
  checkFrontmatter,
  checkNoStatePlans,
  checkPlanNaming,
  checkRootMarkdown,
  hasFrontmatter,
  validate,
};
