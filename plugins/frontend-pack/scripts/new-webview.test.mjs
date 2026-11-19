// Tests for new-webview.mjs (no network: arguments, --dry-run, index.html patch, template contents).
// Run: node --test plugins/frontend-pack/scripts/new-webview.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { KIT, PACKAGES, VIEWPORT, parseArgs, patchHtml, planSteps, run } from './new-webview.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'new-webview.mjs');
const ROOT = join(dirname(SCRIPT), '..');
const TEMPLATE = join(ROOT, 'templates', 'mbank-webview');
const cli = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });

test('parseArgs: directory, --name, --dry-run; rejects bad input', () => {
  assert.deepEqual(parseArgs(['pay', '--name', 'Mbank Pay', '--dry-run']), { dir: 'pay', name: 'Mbank Pay', dryRun: true, help: false });
  assert.equal(parseArgs(['pay', '--name=Төлөм']).name, 'Төлөм');
  assert.throws(() => parseArgs([]), /project directory/);
  assert.throws(() => parseArgs(['a', 'b']), /One directory only/);
  assert.throws(() => parseArgs(['a', '--kit', 'copy']), /Unknown option --kit/);
});

test('refuses a non-empty directory, CLI exits 1', () => {
  const dir = mkdtempSync(join(tmpdir(), 'new-webview-'));
  try {
    writeFileSync(join(dir, 'keep.txt'), 'x');
    const result = cli(dir, '--dry-run');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /is not empty/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('--dry-run prints the plan and touches nothing', () => {
  const dir = join(mkdtempSync(join(tmpdir(), 'new-webview-')), 'app');
  const lines = [];
  const steps = run({ dir, name: 'X', dryRun: true }, (l) => lines.push(l));
  assert.equal(existsSync(dir), false);
  assert.equal(steps.length, 8);
  assert.match(lines.join('\n'), /add-ui\.mjs tokens utils spinner button card skeleton/);
});

test('plan: whitelisted packages with i18n, kit primitives from the registry', () => {
  const steps = planSteps({ dir: 'app' });
  const install = steps.find((s) => s.title === 'Install packages');
  for (const p of ['i18next', 'react-i18next', '@tanstack/react-router', 'zod']) assert.ok(install.args.includes(p), p);
  const libraries = readFileSync(join(ROOT, 'rules', 'libraries.json'), 'utf8');
  for (const p of ['i18next', 'react-i18next', 'zod']) assert.match(libraries, new RegExp(p.replace('/', '\\/')));
  const registry = JSON.parse(readFileSync(join(ROOT, 'registry', 'mbank', 'registry.json'), 'utf8'));
  for (const item of KIT) assert.ok(registry.items.some((i) => i.name === item), `kit item ${item}`);
  assert.ok(PACKAGES.length > 10);
});

test('patchHtml: Russian, title, viewport-fit=cover, no phone auto-links', () => {
  const html = patchHtml('<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Vite</title></head>', 'A<b>');
  assert.match(html, /<html lang="ru">/);
  assert.match(html, /<title>Ab><\/title>|<title>Ab>/);
  assert.ok(html.includes(`content="${VIEWPORT}"`));
  assert.match(html, /format-detection/);
});

test('template: bridge, i18n in three languages with the same keys, mocks, tests, UX brief', () => {
  for (const file of [
    'src/shared/bridge/host.ts', 'src/shared/bridge/protocol.ts', 'src/shared/api/http.ts', 'src/app/HostGate.tsx',
    'src/dev/DevHostPanel.tsx', 'src/mocks/handlers.ts', 'src/pages/home/UX.md', 'src/styles/webview.css', '.env.example',
  ]) assert.ok(existsSync(join(TEMPLATE, file)), file);
  const keys = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) => (typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`])).sort();
  const locales = join(TEMPLATE, 'src', 'shared', 'i18n', 'locales');
  const [ru, ...others] = ['ru', 'ky', 'en'].map((l) => keys(JSON.parse(readFileSync(join(locales, `${l}.json`), 'utf8'))));
  for (const other of others) assert.deepEqual(other, ru);
  const tests = readdirSync(join(TEMPLATE, 'src'), { recursive: true }).filter((f) => /\.test\.tsx?$/.test(f));
  assert.ok(tests.length >= 3, 'bridge, http and page tests');
});

test('template: the token never goes to storage or the URL', () => {
  const src = join(TEMPLATE, 'src');
  for (const file of readdirSync(src, { recursive: true })) {
    if (!/\.tsx?$/.test(file) || /\.test\./.test(file)) continue;
    const text = readFileSync(join(src, file), 'utf8');
    assert.doesNotMatch(text, /\b(localStorage|sessionStorage)\.|document\.cookie/, file);
  }
});
