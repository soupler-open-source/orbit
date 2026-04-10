#!/usr/bin/env node

/**
 * Orbit Safety Evaluator v1.0
 * Context-aware security hook for proposed commands.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Patterns that indicate dangerous shell constructs
const BYPASS_PATTERNS = [
  /\$\(.*\)/, // command substitution
  /`.*`/, // backticks
  /base64 --decode/, // obfuscation
  /curl.*\|.*sh/, // pipe to shell
  />.*\/etc\//, // overwriting system files
  /chmod \+x/, // making files executable
  /sh -c/, // nested shells
];

// Base64 obfuscation heuristic — long alphanum string with = padding
const OBFUSCATION_RE = /^[A-Za-z0-9+/]{10,}={0,2}$/;

const INJECTION_PATTERNS = [
  /ignore.*previous.*instructions/i,
  /disregard.*your.*instructions/i,
  /system.*prompt/i,
];

const SENSITIVE_PATHS = [
  '/etc/passwd',
  '/etc/shadow',
  '/etc/sudoers',
  '.ssh/',
  '.bash_history',
  '.aws/',
];

const DESTRUCTIVE_COMMANDS = ['rm', 'mkfs', 'dd', 'format', 'shutdown', 'reboot', 'init'];

function detectInjection(command) {
  return (
    BYPASS_PATTERNS.some((p) => p.test(command)) || INJECTION_PATTERNS.some((p) => p.test(command))
  );
}

function detectObfuscation(payload) {
  return OBFUSCATION_RE.test(String(payload || '').trim());
}

function evaluateRisk(command) {
  for (const pattern of BYPASS_PATTERNS) {
    if (pattern.test(command)) {
      return { score: 9, rationale: `Dangerous shell pattern detected: ${pattern}` };
    }
  }

  if (INJECTION_PATTERNS.some((p) => p.test(command))) {
    return {
      score: 9,
      rationale: 'Prompt injection or system-instruction override attempt detected.',
    };
  }

  if (SENSITIVE_PATHS.some((p) => command.includes(p))) {
    return { score: 8, rationale: 'Access to sensitive system or credential file detected.' };
  }

  const components = command.split(/;|&&|\|\||\|/);
  for (const comp of components) {
    const baseCmd = comp.trim().split(/\s+/)[0].toLowerCase();
    const isDestructive = DESTRUCTIVE_COMMANDS.some(
      (d) => baseCmd === d || baseCmd.startsWith(d + '.')
    );
    if (isDestructive) {
      return { score: 8, rationale: `Destructive command detected in chain: ${baseCmd}` };
    }
  }

  return { score: 0, rationale: 'Command appears benign.' };
}

function evaluateSafety(toolInput) {
  const command = String(toolInput || '');
  const risk = evaluateRisk(command);
  if (risk.score >= 7) {
    return { safe: false, blocked: true, score: risk.score, reason: risk.rationale };
  }
  return { safe: true, blocked: false, score: risk.score, reason: risk.rationale };
}

function findProjectRoot(start) {
  let curr = start;
  while (curr !== path.parse(curr).root) {
    if (fs.existsSync(path.join(curr, 'orbit.registry.json'))) return curr;
    curr = path.dirname(curr);
  }
  return start;
}

// CLI entry point — side-effect-free on import
if (require.main === module) {
  const ARGS = process.argv.slice(2);
  const PROPOSED_COMMAND = ARGS[0];

  if (!PROPOSED_COMMAND) {
    console.error('Usage: safety-evaluator <command> [context_path]');
    process.exit(1);
  }

  const projectRoot = findProjectRoot(process.cwd());
  // Load registry to validate project context — not used in heuristics yet
  try {
    JSON.parse(fs.readFileSync(path.join(projectRoot, 'orbit.registry.json'), 'utf8'));
  } catch (_) {
    // Non-fatal in CLI mode; heuristics still run
  }

  const result = evaluateSafety(PROPOSED_COMMAND);
  if (!result.safe) {
    console.error(`\n❌ SECURITY BLOCK [Risk Score: ${result.score}]`);
    console.error(`Rationale: ${result.reason}`);
    console.error(`Command: ${PROPOSED_COMMAND}\n`);
    process.exit(result.score);
  } else {
    console.log(`✅ [Safety Evaluator] Command allowed (Score: ${result.score})`);
    process.exit(0);
  }
}

module.exports = { evaluateSafety, detectInjection, detectObfuscation, evaluateRisk };
