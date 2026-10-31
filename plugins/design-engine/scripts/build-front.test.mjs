import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs, plan, run } from './build-front.mjs';

const roots = { figma: '/p/figma-pack', frontend: '/p/frontend-pack' };
const withDir = (fn) => {
  const dir = mkdtempSync(join(tmpdir(), 'build-front-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

test('parseArgs needs a spec and --project, rejects unknown options and a bad --kit', () => {
  assert.deepEqual(parseArgs(['s.json', '--project', 'app', '--dev']).dev, true);
  assert.throws(() => parseArgs(['s.json']), /Usage/);
  assert.throws(() => parseArgs(['s.json', '--project', 'a', '--nope']), /Unknown option/);
  assert.throws(() => parseArgs(['s.json', '--project', 'a', '--kit', 'zip']), /package or copy/);
});

test('a new folder gets spec check, scaffold, generate and the four project checks in order', () => withDir((dir) => {
  const steps = plan(parseArgs(['s.json', '--project', join(dir, 'app'), '--kit', 'copy']), roots);
  assert.deepEqual(steps.map(([id]) => id), ['spec-check', 'scaffold', 'generate', 'typecheck', 'lint', 'test', 'build']);
  assert.ok(steps[1][2].includes('--kit') && steps[1][2].includes('copy'));
}));

test('an existing project is regenerated without scaffold; a non-empty folder without a project is refused', () => withDir((dir) => {
  writeFileSync(join(dir, 'package.json'), '{}');
  const ids = plan(parseArgs(['s.json', '--project', dir, '--skip-checks', '--force']), roots).map(([id]) => id);
  assert.deepEqual(ids, ['spec-check', 'generate']);
  const other = join(dir, 'other');
  mkdirSync(other);
  writeFileSync(join(other, 'notes.txt'), 'x');
  assert.throws(() => plan(parseArgs(['s.json', '--project', other]), roots), /not empty/);
}));

test('run stops at the first failed step and reports it; a missing pack is an error, not a crash', () => withDir((dir) => {
  const calls = [];
  const exec = (cmd, args) => {
    calls.push(args.join(' '));
    return args.includes('lint') ? { status: 1, stdout: 'src/x.tsx  error  no-unused-vars' } : { status: 0, stdout: 'ok' };
  };
  writeFileSync(join(dir, 'package.json'), '{}');
  const result = run(parseArgs(['s.json', '--project', dir]), { exec, resolver: (n) => `/p/${n}` });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'lint failed');
  assert.deepEqual(result.steps.map((s) => s.status), ['ok', 'ok', 'ok', 'failed']);
  assert.match(result.steps.at(-1).output, /no-unused-vars/);
  assert.match(run(parseArgs(['s.json', '--project', dir]), { resolver: () => null }).error, /not installed/);
}));
