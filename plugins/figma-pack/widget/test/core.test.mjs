// Pure logic of the shadcn Tokens widget: model, contrast, scopes, write plan, exports, import.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import TOKENS from '../../skills/ds-tokens/references/shadcn-tokens.json' with { type: 'json' };
import { buildModel, groupOf, toPx, normValue, sameValue, checkTokens, counters, GROUPS } from '../core/model.js';
import { contrastIssues } from '../core/checks.js';
import { scopesOf, planWrites, statusOf, fileStatus } from '../core/sync.js';
import { exportTokensJson, tokensCss, registryTheme } from '../core/exports.js';
import { importTokens } from '../core/io.js';

test('the bundled source is the canonical shadcn set: 31 colours + radius', () => {
  assert.deepEqual(checkTokens(TOKENS), []);
  const { rows } = buildModel(TOKENS);
  assert.equal(rows.length, 32);
  assert.equal(rows.filter((r) => r.kind === 'color').length, 31);
  assert.ok(rows.every((r) => !r.edited));
  for (const g of new Set(rows.map((r) => r.group))) assert.ok(GROUPS.some((x) => x.id === g), g);
  assert.equal(groupOf('sidebar-primary-foreground'), 'sidebar');
  assert.equal(groupOf('chart-3'), 'chart');
  assert.equal(groupOf('input'), 'border');
  assert.equal(groupOf('card-foreground'), 'base');
  assert.equal(toPx(TOKENS.radius), 10);
});

test('values: oklch and hex are both accepted, compared as colours; radius in rem or px', () => {
  assert.equal(normValue('color', ' oklch(0.5  0.1 120) '), 'oklch(0.5 0.1 120)');
  assert.equal(normValue('color', '#7C3AED'), '#7c3aed');
  assert.ok(Number.isNaN(normValue('color', 'red')));
  assert.equal(normValue('radius', '12'), '12px');
  assert.equal(normValue('radius', '0.5rem'), '0.5rem');
  assert.ok(Number.isNaN(normValue('radius', '-1px')));
  assert.equal(sameValue('oklch(0.205 0 0)', '#171717'), true);
  assert.equal(sameValue('0.625rem', '10px', 'radius'), true);
});

test('edits mark rows; radius dark follows light', () => {
  const m = buildModel(TOKENS, { edits: { primary: { light: '#7c3aed' }, radius: { light: '12px' } } });
  const primary = m.rows.find((r) => r.name === 'primary');
  assert.deepEqual([primary.light, primary.dark, primary.edited], ['#7c3aed', TOKENS.colors.primary.dark, true]);
  const radius = m.rows.find((r) => r.name === 'radius');
  assert.deepEqual([radius.light, radius.dark, radius.edited], ['12px', '12px', true]);
  assert.equal(counters(m).edited, 2);
  // An edit equal to the source (other notation) is not an edit.
  assert.equal(buildModel(TOKENS, { edits: { primary: { light: '#171717' } } }).rows.find((r) => r.name === 'primary').edited, false);
});

test('contrast: the shadcn defaults pass AA; a bad primary-foreground is reported in its mode', () => {
  assert.deepEqual(contrastIssues(buildModel(TOKENS).rows).filter((i) => !i.ok), []);
  const pairs = contrastIssues(buildModel(TOKENS).rows);
  assert.ok(pairs.some((p) => p.fg === 'sidebar-primary-foreground' && p.bg === 'sidebar-primary'));
  assert.ok(pairs.some((p) => p.fg === 'muted-foreground' && p.bg === 'muted' && p.min === 3));
  const bad = contrastIssues(buildModel(TOKENS, { edits: { 'primary-foreground': { light: 'oklch(0.3 0 0)' } } }).rows).filter((i) => !i.ok);
  assert.deepEqual(bad.map((i) => [i.fg, i.bg, i.mode]), [['primary-foreground', 'primary', 'light']]);
});

test('scopes: fills for backgrounds, TEXT_FILL for *-foreground, STROKE_COLOR for border/input/ring', () => {
  assert.deepEqual(scopesOf('background'), ['FRAME_FILL', 'SHAPE_FILL']);
  assert.deepEqual(scopesOf('sidebar-primary'), ['FRAME_FILL', 'SHAPE_FILL']);
  assert.deepEqual(scopesOf('card-foreground'), ['TEXT_FILL']);
  assert.deepEqual(scopesOf('sidebar-primary-foreground'), ['TEXT_FILL']);
  for (const n of ['border', 'ring', 'sidebar-border', 'sidebar-ring']) assert.deepEqual(scopesOf(n), ['STROKE_COLOR'], n);
  assert.ok(scopesOf('input').includes('STROKE_COLOR'));
  assert.ok(scopesOf('destructive').includes('TEXT_FILL'));
  assert.deepEqual(scopesOf('radius', 'radius'), ['CORNER_RADIUS']);
});

test('planWrites: every row with all; only edited / differing rows otherwise; values are Figma RGBA and px', () => {
  const all = planWrites(buildModel(TOKENS), { all: true });
  assert.equal(all.writes.length, 32);
  assert.deepEqual(all.skipped, []);
  const border = all.writes.find((w) => w.name === 'border');
  assert.equal(border.type, 'COLOR');
  assert.equal(border.values.dark.a, 0.1, 'alpha kept');
  assert.equal(border.codeSyntax, 'var(--border)');
  const radius = all.writes.find((w) => w.name === 'radius');
  assert.deepEqual([radius.type, radius.values.light, radius.values.dark], ['FLOAT', 10, 10]);
  assert.equal(planWrites(buildModel(TOKENS)).writes.length, 0, 'nothing edited, nothing scanned');
  const edited = planWrites(buildModel(TOKENS, { edits: { ring: { light: '#7c3aed', dark: '#7c3aed' } } }));
  assert.deepEqual(edited.writes.map((w) => w.name), ['ring']);
  // A scan with a missing variable adds it even without an edit.
  const snapshot = { vars: { background: { light: '#ffffff', dark: '#0a0a0a' } } };
  const plan = planWrites(buildModel(TOKENS), { snapshot });
  assert.equal(plan.writes.length, 31, 'all but background (bound)');
});

test('status of a row against a scan', () => {
  const rows = buildModel(TOKENS).rows;
  const by = (n) => rows.find((r) => r.name === n);
  const snapshot = { vars: { background: { light: '#ffffff', dark: '#0a0a0a' }, border: { light: '#e5e5e5', dark: '#ffffff' }, radius: { light: 10, dark: 10 } }, library: { ring: true } };
  assert.equal(statusOf(by('background'), snapshot), 'bound');
  assert.equal(statusOf(by('border'), snapshot), 'differs', 'dark has no alpha in the file');
  assert.equal(statusOf(by('radius'), snapshot), 'bound');
  assert.equal(statusOf(by('ring'), snapshot), 'library');
  assert.equal(statusOf(by('primary'), snapshot), 'missing');
  assert.equal(statusOf(by('primary'), null), 'unknown');
  assert.equal(fileStatus(rows, snapshot).totals.bound, 2);
});

test('exports: shadcn-tokens.json keeps the schema and names; tokens.css and the registry theme', () => {
  const edits = { primary: { light: 'oklch(0.541 0.247 293.009)', dark: '#8b5cf6' }, radius: { light: '0.5rem' } };
  const json = exportTokensJson(TOKENS, { edits });
  assert.equal(json.$schema, 'shadcn/tokens@1');
  assert.deepEqual(Object.keys(json.colors), Object.keys(TOKENS.colors));
  assert.deepEqual(json.colors.primary, { light: 'oklch(0.541 0.247 293.009)', dark: '#8b5cf6' });
  assert.equal(json.radius, '0.5rem');
  assert.equal(TOKENS.colors.primary.light, 'oklch(0.205 0 0)', 'source untouched');
  const model = buildModel(TOKENS, { edits });
  const css = tokensCss(TOKENS, model);
  assert.match(css, /:root \{\n {2}--radius: 0\.5rem;\n {2}--background: oklch\(1 0 0\);/);
  assert.match(css, /\.dark \{[^}]*--border: oklch\(1 0 0 \/ 10%\);/);
  assert.match(css, /--color-sidebar-primary-foreground: var\(--sidebar-primary-foreground\);/);
  assert.match(css, /--radius-xl: calc\(var\(--radius\) \* 1\.4\);/);
  assert.match(css, /--font-sans: 'Geist Variable', sans-serif;/);
  const item = registryTheme(TOKENS, model);
  assert.equal(item.type, 'registry:theme');
  assert.equal(item.cssVars.light.primary, 'oklch(0.541 0.247 293.009)');
  assert.equal(item.cssVars.dark.radius, undefined);
});

test('import: values of known names become edits; unknown names are never added', () => {
  const doc = { $schema: 'shadcn/tokens@1', radius: '0.75rem', colors: { primary: { light: '#7c3aed', dark: 'oklch(0.922 0 0)' }, background: { light: '#ffffff', dark: '#0a0a0a' }, 'brand-x': { light: '#000000', dark: '#000000' } } };
  const res = importTokens(TOKENS, JSON.stringify(doc));
  assert.deepEqual(res.errors, []);
  assert.deepEqual(res.edits, { primary: { light: '#7c3aed', dark: 'oklch(0.922 0 0)' }, radius: { light: '0.75rem' } });
  assert.deepEqual(res.ignored, ['brand-x']);
  assert.match(importTokens(TOKENS, '{').errors[0], /Не JSON/);
  assert.match(importTokens(TOKENS, { theme: { vars: [] } }).errors.join(), /shadcn\/tokens@1/);
  assert.match(importTokens(TOKENS, { $schema: 'shadcn/tokens@1', colors: { primary: { light: 'red' } } }).errors.join(), /primary/);
});
