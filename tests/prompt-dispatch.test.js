import { describe, it, expect } from 'vitest';
import {
  classifyPromptDispatch,
  dispatchPrompt,
  extractExplicitOrbitCommand,
  inferWorkflow,
} from '../bin/prompt-dispatch.js';

describe('classifyPromptDispatch — explicit commands', () => {
  it('routes explicit /orbit:quick to quick command', () => {
    const result = classifyPromptDispatch('/orbit:quick #42');
    expect(result.type).toBe('explicit_command');
    expect(result.command).toBe('/orbit:quick');
  });

  it('routes orbit:review without leading slash', () => {
    const result = classifyPromptDispatch('orbit:review');
    expect(result.type).toBe('explicit_command');
    expect(result.command).toBe('/orbit:review');
  });

  it('captures remainder from explicit command', () => {
    const result = classifyPromptDispatch('/orbit:quick #99 fix the bug');
    expect(result.remainder).toContain('#99');
  });
});

describe('classifyPromptDispatch — inferred workflows', () => {
  it('infers /orbit:next for "pick next task"', () => {
    const result = classifyPromptDispatch('pick next task');
    expect(result.type).toBe('inferred_workflow');
    expect(result.command).toBe('/orbit:next');
  });

  it('infers /orbit:review for "review this"', () => {
    const result = classifyPromptDispatch('review this code');
    expect(result.type).toBe('inferred_workflow');
    expect(result.command).toBe('/orbit:review');
  });

  it('returns unclassified for unrecognised prompt', () => {
    const result = classifyPromptDispatch('what is the meaning of life');
    expect(result.type).toBe('unclassified');
    expect(result.command).toBeNull();
  });

  it('infers continuation when active issue is set and state is in-progress', () => {
    const result = classifyPromptDispatch('continue', {
      activeIssue: '#55',
      workflowState: 'implementation_done',
    });
    expect(result.type).toBe('inferred_workflow');
    expect(result.command).toContain('#55');
  });
});

describe('dispatchPrompt', () => {
  it('returns executed: false for unclassified prompt', () => {
    const result = dispatchPrompt('what is 2+2');
    expect(result.executed).toBe(false);
    expect(result.output).toBeNull();
  });

  it('returns dispatch object with command field', () => {
    const result = dispatchPrompt('orbit:review');
    expect(result.dispatch).toBeDefined();
    expect(result.dispatch.command).toBeDefined();
  });

  it('returns executed: false for non-dispatchable explicit command', () => {
    // /orbit:ship is recognised but not in EXECUTABLE_COMMANDS
    const result = dispatchPrompt('/orbit:ship');
    expect(result.executed).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('extractExplicitOrbitCommand', () => {
  it('returns null for plain prompt', () => {
    expect(extractExplicitOrbitCommand('fix the login bug')).toBeNull();
  });

  it('normalises command to lowercase with leading slash', () => {
    const result = extractExplicitOrbitCommand('ORBIT:QUICK #1');
    expect(result.command).toBe('/orbit:quick');
  });
});

describe('inferWorkflow', () => {
  it('returns unclassified when no patterns match', () => {
    const result = inferWorkflow('write me a poem');
    expect(result.type).toBe('unclassified');
  });

  it('matches "what next" as next-task prompt', () => {
    const result = inferWorkflow('what next');
    expect(result.command).toBe('/orbit:next');
  });
});
