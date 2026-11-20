import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hexToOklch, oklchToHex, contrast, onColor, parseOklch, oklchToRgba, rgbaToOklch, rgbToHex } from '../core/color.js';
import { SHADCN_TOKENS, validateTokens, contrastReport, COLOR_TOKENS, scopesFor, radiusScale, RADIUS, RADIUS_TOKENS, rgbaOf, hexOf } from '../core/tokens.js';
import { toShadcnCss } from '../core/css.js';
import { validateSpec, framePlan, normalizeSpec } from '../core/spec.js';
import { fakeRows } from '../core/fake.js';
import { readFileSync } from 'node:fs';

const CANON = JSON.parse(readFileSync(new URL('../../skills/ds-tokens/references/shadcn-tokens.json', import.meta.url)));

test('hex -> oklch -> hex round-trip keeps the color', () => {
  for (const hex of ['#fabf00', '#16a34a', '#0a0a0a', '#ffffff', '#2563eb']) {
    assert.equal(oklchToHex(hexToOklch(hex)), hex);
  }
});

test('oklch() strings parse, convert to Figma RGBA with alpha, and back', () => {
  assert.deepEqual(parseOklch('oklch(0.145 0 0)'), { l: 0.145, c: 0, h: 0, a: 1 });
  assert.deepEqual(parseOklch('oklch(1 0 0 / 10%)'), { l: 1, c: 0, h: 0, a: 0.1 });
  const pct = parseOklch('oklch(57.7% 0.245 27.325deg / 0.5)');
  assert.ok(Math.abs(pct.l - 0.577) < 1e-9 && pct.c === 0.245 && pct.h === 27.325 && pct.a === 0.5, JSON.stringify(pct));
  assert.throws(() => parseOklch('#fff'));
  assert.equal(rgbToHex(oklchToRgba('oklch(1 0 0)')), '#ffffff');
  assert.equal(oklchToRgba('oklch(1 0 0)').a, 1);
  assert.equal(rgbToHex(oklchToRgba('oklch(0 0 0)')), '#000000');
  const glass = oklchToRgba('oklch(1 0 0 / 15%)');
  assert.equal(glass.a, 0.15);
  assert.equal(rgbToHex(oklchToRgba('oklch(0.145 0 0)')), '#0a0a0a', 'shadcn neutral-950');
  assert.equal(rgbToHex(oklchToRgba('oklch(0.922 0 0)')), '#e5e5e5', 'shadcn neutral-200');
  assert.equal(rgbToHex(oklchToRgba('oklch(0.577 0.245 27.325)')), '#e7000b', 'out of gamut: clipped per channel, like Tailwind');
  assert.equal(rgbToHex(oklchToRgba('oklch(0.704 0.191 22.216)')), '#ff6467', 'Tailwind red-400');
  // an in-gamut chromatic colour: the round trip stays within 8-bit rounding (clipped ones change by design)
  const back = parseOklch(rgbaToOklch(oklchToRgba('oklch(0.6 0.1 150)')));
  assert.ok(Math.abs(back.l - 0.6) < 0.005 && Math.abs(back.c - 0.1) < 0.005 && Math.abs(back.h - 150) < 1, JSON.stringify(back));
  assert.equal(rgbaToOklch(oklchToRgba('oklch(1 0 0 / 10%)')), 'oklch(1 0 0 / 10%)');
  assert.equal(rgbaToOklch({ r: 1, g: 1, b: 1 }), 'oklch(1 0 0)');
});

test('the token set is exactly the canonical shadcn file: 37 colours (31 + 6 status), radius scale in px', () => {
  assert.equal(SHADCN_TOKENS.$schema, 'shadcn/tokens@1');
  assert.deepEqual(COLOR_TOKENS, Object.keys(CANON.colors));
  assert.equal(COLOR_TOKENS.length, 37);
  const status = ['success', 'success-foreground', 'warning', 'warning-foreground', 'info', 'info-foreground'];
  assert.deepEqual(COLOR_TOKENS.slice(COLOR_TOKENS.indexOf('destructive') + 1, COLOR_TOKENS.indexOf('destructive') + 7), status);
  for (const gone of ['destructive-foreground', 'brand', 'status-muted', 'success-muted']) assert.ok(!COLOR_TOKENS.includes(gone), gone);
  assert.equal(RADIUS, 12); // Mbank radius/m
  assert.deepEqual(radiusScale(), { sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32, '4xl': 40 }); // Figma radius/*
  assert.deepEqual(RADIUS_TOKENS, ['radius', 'radius-sm', 'radius-md', 'radius-lg', 'radius-xl', 'radius-2xl', 'radius-3xl', 'radius-4xl']);
  for (const k of COLOR_TOKENS) for (const th of ['light', 'dark']) assert.ok(rgbaOf(k, th).a > 0, `${k} ${th}`);
  assert.equal(hexOf('background', 'light'), '#ffffff');
  assert.equal(rgbaOf('border', 'dark').a, 1); // Mbank borders are opaque
});

test('canonical tokens validate and read in both themes', () => {
  assert.deepEqual(validateTokens(CANON), []);
  // Known exception: green sidebar-primary (#16a34a, Mbank Figma) with white text is 3.3:1 in both modes.
  assert.deepEqual(contrastReport().filter((r) => !r.ok).map((r) => [r.fg, r.bg, r.mode]),
    [['sidebar-primary-foreground', 'sidebar-primary', 'light'], ['sidebar-primary-foreground', 'sidebar-primary', 'dark']]);
  const extra = JSON.parse(JSON.stringify(CANON));
  extra.colors.brand = { light: 'oklch(0.6 0.1 150)', dark: 'oklch(0.6 0.1 150)' };
  delete extra.colors.ring;
  extra.colors.border.dark = 'nope';
  const errors = validateTokens(extra);
  assert.ok(errors.includes('colors.brand: not a shadcn token'));
  assert.ok(errors.includes('colors.ring.light: missing'));
  assert.ok(errors.some((e) => e.startsWith('colors.border.dark: bad value')));
});

test('contrast and onColor', () => {
  assert.ok(Math.abs(contrast('#000000', '#ffffff') - 21) < 0.01);
  assert.equal(onColor('#fabf00'), '#09090b');
  assert.equal(onColor('#1d4ed8'), '#ffffff');
});

test('globals.css: every shadcn colour in :root and .dark as oklch, theme mapping and radius scale', () => {
  const css = toShadcnCss();
  for (const k of COLOR_TOKENS) {
    assert.ok(css.includes(`  --${k}: ${CANON.colors[k].light};`), k);
    assert.ok(css.includes(`  --${k}: ${CANON.colors[k].dark};`), k);
    assert.match(css, new RegExp(`--color-${k}: var\\(--${k}\\)`));
  }
  assert.match(css, /--radius: 12px;/);
  assert.match(css, /--radius-xl: 20px;/); // Figma radius/xl
  assert.match(css, /--font-sans: 'Inter Mbank', 'Inter', 'Geist Variable', ui-sans-serif, system-ui, sans-serif;/);
  assert.ok(!/--(brand|status-muted|destructive-foreground)\b/.test(css), 'shadcn names only');
  for (const k of ['success', 'warning', 'info']) assert.match(css, new RegExp(`--color-${k}-foreground: var\\(--${k}-foreground\\)`));
});

test('variable scopes by role (same set as the widget)', () => {
  assert.deepEqual(scopesFor('primary-foreground'), ['TEXT_FILL']);
  assert.deepEqual(scopesFor('background'), ['FRAME_FILL', 'SHAPE_FILL']);
  assert.deepEqual(scopesFor('border'), ['STROKE_COLOR']);
  assert.deepEqual(scopesFor('sidebar-ring'), ['STROKE_COLOR']);
  assert.deepEqual(scopesFor('input'), ['STROKE_COLOR', 'FRAME_FILL', 'SHAPE_FILL']);
  assert.deepEqual(scopesFor('destructive'), ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR']);
  assert.deepEqual(scopesFor('success'), ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR']);
  assert.deepEqual(scopesFor('info-foreground'), ['TEXT_FILL']);
  assert.deepEqual(scopesFor('chart-3'), ['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR']);
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

// Builder and widget write the same «shadcn» variables: values and scopes must be identical.
test('oklchToRgba equals the widget (oklchToSrgb, clipped per channel) for every canonical value; scopes equal scopesOf', async () => {
  const { oklchToSrgb, parseOklch: widgetParse } = await import('../../widget/core/oklch.js');
  const { scopesOf } = await import('../../widget/core/sync.js');
  const clip = (v) => Math.min(1, Math.max(0, v));
  for (const k of COLOR_TOKENS) {
    for (const th of ['light', 'dark']) {
      const css = CANON.colors[k][th];
      const w = oklchToSrgb(widgetParse(css));
      const mine = oklchToRgba(css);
      for (const ch of ['r', 'g', 'b']) assert.ok(Math.abs(mine[ch] - clip(w[ch])) < 1e-9, `${k} ${th} ${ch}: ${mine[ch]} vs ${clip(w[ch])}`);
      assert.equal(mine.a, widgetParse(css).alpha, `${k} ${th} alpha`);
    }
    assert.deepEqual(scopesFor(k), scopesOf(k), `${k} scopes`);
  }
  const d = oklchToRgba('oklch(0.577 0.245 27.325)');
  assert.ok(Math.abs(d.r - 0.90646) < 1e-5 && d.g === 0 && Math.abs(d.b - 0.04221) < 1e-5, JSON.stringify(d));
});
