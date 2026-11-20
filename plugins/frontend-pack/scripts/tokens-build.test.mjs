// Tests for tokens-build.mjs on the real shadcn-tokens.json and tmp copies.
// Run: node --test plugins/frontend-pack/scripts/tokens-build.test.mjs
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { COLORS, DEFAULTS, compareCss, parseCss, render, validate } from './tokens-build.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'tokens-build.mjs');
const TOKENS = JSON.parse(readFileSync(DEFAULTS.tokens, 'utf8'));
const CSS = readFileSync(DEFAULTS.out, 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));
const cli = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
let dir;

before(() => { dir = mkdtempSync(join(tmpdir(), 'tokens-build-')); });
after(() => rmSync(dir, { recursive: true, force: true }));

test('the committed tokens.css is generated from shadcn-tokens.json (--check passes)', () => {
  const r = cli('--check');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /tokens\.css is up to date/);
  assert.equal(render(TOKENS), CSS);
});

test('the token set is exactly the 31 shadcn colours + 6 status colours, light on :root and dark on .dark', () => {
  assert.deepEqual(validate(TOKENS), []);
  assert.equal(COLORS.length, 37);
  const css = parseCss(CSS);
  assert.equal(css.get(':root').get('--primary'), TOKENS.colors.primary.light);
  assert.equal(css.get('.dark').get('--primary'), TOKENS.colors.primary.dark);
  assert.equal(css.get(':root').get('--radius'), TOKENS.radius);
  const theme = css.get('@theme inline');
  for (const c of COLORS) assert.equal(theme.get(`--color-${c}`), `var(--${c})`);
  assert.equal(css.get('@theme').get('--radius-lg'), '16px'); // Figma radius/l, overridable (plain @theme)
  assert.equal(css.get('@theme').get('--text-sm'), TOKENS.text.sm.size);
  assert.equal(theme.get('--font-sans'), TOKENS.font.sans);
  const custom = [...css.get(':root').keys()].filter((k) => k !== '--radius' && !COLORS.includes(k.slice(2)));
  assert.deepEqual(custom, [], 'no custom tokens in :root');
  assert.ok(CSS.includes('@custom-variant dark (&:is(.dark *));'));
  assert.ok(!/surface-|--brand|data-brand|-hover|-active/.test(CSS));
});

test('custom or missing tokens are rejected', () => {
  const extra = clone(TOKENS);
  extra.colors.brand = { light: 'green', dark: 'green' };
  assert.match(validate(extra).join('\n'), /colors\.brand: not a shadcn token/);
  const missing = clone(TOKENS);
  delete missing.colors.ring;
  delete missing.colors.card.dark;
  assert.match(validate(missing).join('\n'), /colors\.ring is missing/);
  assert.match(validate(missing).join('\n'), /colors\.card\.dark is required/);
  assert.throws(() => render(missing), /invalid/);
});

test('round trip: write to a new path, edit a value, --check reports the diff', () => {
  const out = join(dir, 'tokens.css');
  assert.equal(cli('--out', out).status, 0);
  assert.equal(cli('--check', '--out', out).status, 0);
  writeFileSync(out, readFileSync(out, 'utf8').replace(`--ring: ${TOKENS.colors.ring.light}`, '--ring: red'));
  const r = cli('--check', '--out', out);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /:root --ring: expected .+, got red/);
});

test('--tokens reads another file; a project changes values, not names', () => {
  const t = clone(TOKENS);
  t.colors.primary.light = 'oklch(0.5 0.2 250)';
  const src = join(dir, 'tokens.json');
  writeFileSync(src, JSON.stringify(t));
  const out = join(dir, 'brand.css');
  assert.equal(cli('--tokens', src, '--out', out).status, 0);
  assert.equal(parseCss(readFileSync(out, 'utf8')).get(':root').get('--primary'), 'oklch(0.5 0.2 250)');
});

test('compareCss lists changed, added and removed declarations; parseCss keeps nested at-rules', () => {
  const diffs = compareCss(':root { --a: 1; --b: 2; }', ':root { --a: 3; --c: 4; }');
  assert.deepEqual(diffs.map((d) => [d.css, d.expected, d.actual]), [['--a', '1', '3'], ['--b', '2', null], ['--c', null, '4']]);
  const nested = parseCss('@layer base { body { @apply bg-background; } }');
  assert.equal(nested.get('@layer base > body').get('@apply'), 'bg-background');
});

test('unknown arguments fail with exit 2', () => {
  assert.equal(cli('--map', 'x').status, 2);
});
