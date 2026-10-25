// Tests for new-crm.mjs (no network: only argument checks and --dry-run).
// Run: node --test plugins/frontend-pack/scripts/new-crm.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DEV_PACKAGES, PACKAGES, parseArgs, planSteps, run } from './new-crm.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'new-crm.mjs');
const TEMPLATE = join(dirname(SCRIPT), '..', 'templates', 'mbank-crm');
const cli = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });

test('parseArgs: directory, --name, --dry-run; rejects bad input', () => {
  assert.deepEqual(parseArgs(['crm', '--name', 'Back office', '--dry-run']), { dir: 'crm', name: 'Back office', dryRun: true, help: false });
  assert.equal(parseArgs(['crm', '--name=Админка']).name, 'Админка');
  assert.throws(() => parseArgs([]), /project directory/);
  assert.throws(() => parseArgs(['a', 'b']), /One directory only/);
  assert.throws(() => parseArgs(['a', '--name']), /--name needs a value/);
  assert.throws(() => parseArgs(['a', '--force']), /Unknown option --force/);
});

test('refuses a non-empty directory, CLI exits 1', () => {
  const dir = mkdtempSync(join(tmpdir(), 'new-crm-'));
  try {
    writeFileSync(join(dir, 'keep.txt'), 'x');
    const result = cli(dir, '--dry-run');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /is not empty/);
    assert.equal(cli().status, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('--dry-run prints the plan and touches nothing', () => {
  const parent = mkdtempSync(join(tmpdir(), 'new-crm-'));
  const dir = join(parent, 'crm');
  try {
    const out = [];
    const steps = run(parseArgs([dir, '--dry-run']), (line) => out.push(line));
    const text = out.join('\n');
    assert.equal(existsSync(dir), false);
    assert.deepEqual(readdirSync(parent), []);
    assert.match(text, /create-vite@latest crm --template react-ts --eslint --no-interactive --no-immediate/);
    assert.match(text, /add-ui\.mjs all --cwd/);
    assert.match(text, /msw init public --save/);
    assert.equal(steps.length, 7);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test('installs only allowed packages: kit + MSW, no Lucide', () => {
  const install = planSteps({ dir: 'x', name: 'n' }).filter((s) => s.kind === 'cmd' && s.command === 'npm');
  const all = install.flatMap((s) => s.args);
  for (const pkg of ['radix-ui', 'tw-animate-css', 'class-variance-authority', '@tanstack/react-router', 'zod']) assert.ok(all.includes(pkg), pkg);
  for (const pkg of ['msw', 'vitest', 'jsdom', '@testing-library/react']) assert.ok(DEV_PACKAGES.includes(pkg), pkg);
  assert.ok(!PACKAGES.includes('lucide-react'));
});

test('template has a UX.md and a test next to every page with data', () => {
  const pages = join(TEMPLATE, 'src', 'pages');
  for (const page of readdirSync(pages)) {
    const files = readdirSync(join(pages, page));
    if (files.some((f) => f.endsWith('Page.tsx')) && page !== 'not-found') assert.ok(files.includes('UX.md'), `${page}: UX.md`);
  }
  for (const page of ['pipeline', 'application']) assert.ok(readdirSync(join(pages, page)).some((f) => f.endsWith('.test.tsx')), page);
  const setup = readFileSync(join(TEMPLATE, 'src', 'test', 'setup.ts'), 'utf8');
  assert.match(setup, /onUnhandledFrame/, 'MSW 3 option (onUnhandledRequest is ignored)');
  assert.match(setup, /window\.scrollTo/, 'jsdom stub for TanStack Router');
});
