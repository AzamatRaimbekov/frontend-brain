import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hexToOklch, oklchToHex, contrast, onColor } from '../core/color.js';
import { generateTokens, validateTokens, contrastReport, COLOR_TOKENS, scopesFor, withOverrides } from '../core/tokens.js';
import { toShadcnCss } from '../core/css.js';
import { snap, deltaE } from '../core/palette.js';
import { customName, cssVar, fixLegacyName } from '../core/naming.js';
import { validateSpec, framePlan, normalizeSpec } from '../core/spec.js';
import { fakeRows } from '../core/fake.js';
import { readFileSync } from 'node:fs';

test('oklch round-trip keeps the color', () => {
  for (const hex of ['#fabf00', '#16a34a', '#0a0a0a', '#ffffff', '#2563eb']) {
    assert.ok(deltaE(hex, oklchToHex(hexToOklch(hex))) < 0.5, hex);
  }
});

test('contrast and onColor', () => {
  assert.ok(Math.abs(contrast('#000000', '#ffffff') - 21) < 0.01);
  assert.equal(onColor('#fabf00'), '#09090b');
  assert.equal(onColor('#1d4ed8'), '#ffffff');
});

test('generated tokens are complete and readable for several brands', () => {
  for (const brand of ['#fabf00', '#16a34a', '#2563eb', '#da78f2', '#111111']) {
    const t = generateTokens({ name: 'p', brand, neutral: 'zinc' });
    assert.deepEqual(validateTokens(t), [], brand);
    const bad = contrastReport(t).filter((r) => !r.ok);
    assert.deepEqual(bad, [], `${brand}: ${JSON.stringify(bad)}`);
  }
});

test('override re-derives a readable foreground', () => {
  const t = withOverrides(generateTokens({ brand: '#2563eb' }), { light: { primary: '#fde047' } });
  assert.ok(contrast(t.colors.light['primary-foreground'], '#fde047') >= 4.5);
});

test('css has every token in both themes plus custom tokens', () => {
  const t = { ...generateTokens({ name: 'mmarket', brand: '#fabf00' }), custom: { 'mmarket-badge-bg-orange': { light: '#ffd6a7', dark: '#7e2a0c' } } };
  const css = toShadcnCss(t);
  for (const k of COLOR_TOKENS) { assert.match(css, new RegExp(`--${k}: #`)); assert.match(css, new RegExp(`--color-${k}: var`)); }
  assert.match(css, /--mmarket-badge-bg-orange: #ffd6a7/);
  assert.match(css, /--color-mmarket-badge-bg-orange: var\(--mmarket-badge-bg-orange\)/);
});

test('snap finds the nearest primitive only when close', () => {
  const pal = { 'amber/400': '#ffb900', 'blue/600': '#155dfc' };
  assert.equal(snap('#ffba02', pal).name, 'amber/400');
  assert.equal(snap('#ff00ff', pal), null);
});

test('naming', () => {
  assert.equal(customName('MMarket', 'badge bg orange'), 'custom/mmarket/badge-bg-orange');
  assert.equal(fixLegacyName('custom/mmarket/mmarket badge bg slate'), 'custom/mmarket/badge-bg-slate');
  assert.equal(cssVar('custom/mmarket/badge-bg-slate'), '--mmarket-badge-bg-slate');
  assert.equal(cssVar('primary-foreground'), '--primary-foreground');
  assert.throws(() => customName('', 'x'));
  assert.deepEqual(scopesFor('primary-foreground'), ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR']);
  assert.deepEqual(scopesFor('background'), ['FRAME_FILL', 'SHAPE_FILL']);
  assert.ok(scopesFor('border').includes('STROKE_COLOR'));
});

test('example spec is valid and plans frames', () => {
  const spec = JSON.parse(readFileSync(new URL('../examples/credit-crm.spec.json', import.meta.url)));
  assert.deepEqual(validateSpec(spec), []);
  const plan = framePlan(spec);
  assert.ok(plan.length >= 10);
  assert.ok(normalizeSpec(spec).screens.every((s) => s.shell));
});

test('spec validation reports precise paths', () => {
  const errors = validateSpec({ project: 'x', nav: [], screens: [{ id: 'a', title: 'A', nav: 'nope', states: ['weird'], blocks: [{ type: 'table', columns: ['Сумма:dollars'] }, { type: 'nope' }] }] });
  assert.ok(errors.some((e) => e.includes('screens[0].nav')));
  assert.ok(errors.some((e) => e.includes('states')));
  assert.ok(errors.some((e) => e.includes('columns[0]')));
  assert.ok(errors.some((e) => e.includes('blocks[1].type')));
});

test('fake rows are deterministic', () => {
  assert.deepEqual(fakeRows(['id', 'person', 'money', 'status'], 3, 5), fakeRows(['id', 'person', 'money', 'status'], 3, 5));
});
