#!/usr/bin/env node
/**
 * token-log — append-only token usage log for Orbit commands.
 *
 * Writes JSONL entries to .orbit/state/token-log.jsonl.
 * Token counts are estimate-based (file bytes / 4) until Claude Code
 * exposes actual API counts, at which point callers should pass measured values.
 *
 * Usage:
 *   node bin/token-log.js --command /orbit:resume --tokens-input 21000 --tokens-output 2500
 *   node bin/token-log.js --summary
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LOG_PATH = path.join(ROOT, '.orbit', 'state', 'token-log.jsonl');

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

function appendEntry({ command, tokensInput, tokensOutput, issue, branch }) {
  const entry = {
    ts: new Date().toISOString(),
    command: command || 'unknown',
    tokens_input: Number(tokensInput) || 0,
    tokens_output: Number(tokensOutput) || 0,
    tokens_total: (Number(tokensInput) || 0) + (Number(tokensOutput) || 0),
    ...(issue ? { issue } : {}),
    ...(branch ? { branch } : {}),
  };
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n');
  return entry;
}

function readEntries() {
  if (!fs.existsSync(LOG_PATH)) return [];
  return fs
    .readFileSync(LOG_PATH, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch (_) {
        return null;
      }
    })
    .filter(Boolean);
}

function printSummary() {
  const entries = readEntries();
  if (entries.length === 0) {
    process.stdout.write('No token log entries yet.\n');
    process.stdout.write(
      'Write entries via: node bin/checkpoint.js --tokens-input N --tokens-output N\n'
    );
    return;
  }

  let totalIn = 0;
  let totalOut = 0;

  process.stdout.write('Session Token Log  (.orbit/state/token-log.jsonl)\n');
  process.stdout.write('──────────────────────────────────────────────────────\n');
  for (const e of entries) {
    totalIn += e.tokens_input || 0;
    totalOut += e.tokens_output || 0;
    const ts = e.ts ? e.ts.slice(0, 19).replace('T', ' ') : 'unknown';
    process.stdout.write(
      `  ${ts}  ${String(e.command).padEnd(22)}  in: ${String(e.tokens_input).padStart(6)}  out: ${String(e.tokens_output).padStart(5)}  total: ${String(e.tokens_total).padStart(6)}\n`
    );
  }
  process.stdout.write(
    '─────────────────────────────────────────────────────\n'
  );
  process.stdout.write(
    `  Session total:  in: ${totalIn}  out: ${totalOut}  combined: ${totalIn + totalOut} tokens\n`
  );
}

function run(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);

  if (args.summary) {
    printSummary();
    return;
  }

  if (!args['tokens-input'] && !args['tokens-output']) {
    process.stderr.write(
      'Usage: node bin/token-log.js --command <cmd> --tokens-input N --tokens-output N\n'
    );
    process.stderr.write('       node bin/token-log.js --summary\n');
    process.exit(1);
  }

  const entry = appendEntry({
    command: args.command,
    tokensInput: args['tokens-input'],
    tokensOutput: args['tokens-output'],
    issue: args.issue,
    branch: args.branch,
  });

  process.stdout.write(
    `Token entry written: ${entry.command} — in: ${entry.tokens_input}, out: ${entry.tokens_output}, total: ${entry.tokens_total}\n`
  );
}

if (require.main === module) {
  run();
}

module.exports = { appendEntry, readEntries, printSummary };
