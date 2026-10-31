// Tests for tokens-build.mjs and tokens-normalize.mjs on the real tokens.json / tokens.map.json and tmp copies.
// Run: node --test plugins/frontend-pack/scripts/tokens-build.test.mjs
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DEFAULTS, buildModel, compareCss, parseArgs, parseCss, render, run, shadowCss } from './tokens-build.mjs';
import { colorHex, diffTokens, modeName, normalizeRaw } from './tokens-normalize.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'tokens-build.mjs');
const TOKENS = JSON.parse(readFileSync(DEFAULTS.tokens, 'utf8'));
const MAP = JSON.parse(readFileSync(DEFAULTS.map, 'utf8'));
const CSS = readFileSync(DEFAULTS.out, 'utf8');
let dir;

const clone = (x) => JSON.parse(JSON.stringify(x));
const write = (name, data) => {
  const path = join(dir, name);
  writeFileSync(path, typeof data === 'string' ? data : JSON.stringify(data));
  return path;
};
const cli = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
const themeVar = (tokens, name) => tokens.theme.vars.find((v) => v.name === name);

before(() => { dir = mkdtempSync(join(tmpdir(), 'tokens-build-')); });
after(() => rmSync(dir, { recursive: true, force: true }));

test('the committed tokens.css is generated from tokens.json + tokens.map.json (--check passes)', () => {
  const r = cli('--check');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /tokens\.css is up to date/);
  assert.equal(render(buildModel(TOKENS, MAP), MAP, TOKENS), CSS, 'byte-equal to a fresh build');
});

test('round trip: write to a new path, then --check that path', () => {
  const out = join(dir, 'roundtrip.css');
  assert.equal(cli('--out', out).status, 0);
  assert.deepEqual(parseCss(readFileSync(out, 'utf8')), parseCss(CSS));
  assert.equal(cli('--check', '--out', out).status, 0);
});

test('every selector, @theme block and the brand blocks are generated', () => {
  const css = parseCss(CSS);
  for (const sel of [':root', '.dark', '@theme inline', '@theme', '@layer base > body', '[data-brand="koko"]', '.dark[data-brand="travel"], .dark [data-brand="travel"]']) {
    assert.ok(css.has(sel), sel);
  }
  assert.equal(css.get(':root').get('--foreground'), themeVar(TOKENS, 'text/default').light);
  assert.equal(css.get('.dark').get('--foreground'), themeVar(TOKENS, 'text/default').dark);
  assert.equal(css.get('[data-brand="kassa"]').get('--brand'), '#2563eb');
  assert.equal(css.get('.dark[data-brand="kassa"], .dark [data-brand="kassa"]').get('--brand'), '#3b82f6');
  assert.equal(css.get('@theme').get('--text-sm--line-height'), '20px');
  assert.equal(css.get('@theme').get('--radius-md'), '12px');
  assert.equal(css.get('@theme inline').get('--color-surface-3'), 'var(--surface-3)');
  assert.equal(css.get('@theme inline').get('--shadow-dropdown'), '0 3px 6px var(--shadow-color), 0 11px 11px var(--shadow-color), 0 15px 35px var(--shadow-color)');
  assert.equal(css.get('(top)').get('@custom-variant'), 'dark (&:where(.dark, .dark *))');
  assert.ok(CSS.split('\n').length < 500, 'tokens.css stays under 500 lines');
});

test('--check detects a value changed in Figma and names the Figma variable', () => {
  const tokens = clone(TOKENS);
  themeVar(tokens, 'text/default').light = '#111111';
  const r = cli('--check', '--tokens', write('changed.json', tokens), '--json');
  assert.equal(r.status, 1);
  const report = JSON.parse(r.stdout);
  const d = report.diffs.find((x) => x.selector === ':root' && x.css === '--foreground');
  assert.deepEqual(d, { selector: ':root', css: '--foreground', figma: '2.theme text/default (light)', expected: '#111111', actual: '#0e0f11' });
  assert.equal(report.diffs.length, 1, 'dark and other tokens unchanged');
  const text = cli('--check', '--tokens', join(dir, 'changed.json')).stdout;
  assert.match(text, /:root {2}--foreground {2}<- 2\.theme text\/default \(light\)\n {6}expected #111111 {2}actual #0e0f11/);
});

test('--check detects a brand mode change in 1.brand', () => {
  const tokens = clone(TOKENS);
  tokens.brand.vars.find((v) => v.name === 'brand/default').values[1] = '#000001';
  const report = run({ ...DEFAULTS, tokens: write('brand.json', tokens), from: [], check: true });
  assert.equal(report.ok, false);
  assert.deepEqual(report.diffs.map((d) => [d.selector, d.css, d.figma]), [['[data-brand="kassa"]', '--brand', '1.brand brand/default (kassa)']]);
});

test('--check detects a declaration missing from tokens.css and an extra one', () => {
  const css = CSS.replace(/^ {2}--surface-4: .*\n/m, '').replace('--z-tooltip: 1800;', '--z-tooltip: 1800; --z-extra: 1;');
  const report = run({ ...DEFAULTS, out: write('missing.css', css), from: [], check: true });
  assert.equal(report.ok, false);
  assert.ok(report.diffs.some((d) => d.selector === ':root' && d.css === '--surface-4' && d.actual === null && d.expected === '#cad1d7'));
  assert.ok(report.diffs.some((d) => d.css === '--z-extra' && d.expected === null));
});

test('a Figma variable the map needs but tokens.json lost is an error', () => {
  const tokens = clone(TOKENS);
  tokens.theme.vars = tokens.theme.vars.filter((v) => v.name !== 'text/link');
  const r = cli('--check', '--tokens', write('lost.json', tokens));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /error: Figma variable "text\/link" not found in tokens\.json theme/);
  assert.equal(cli('--tokens', join(dir, 'lost.json'), '--out', join(dir, 'never.css')).status, 1);
});

test('overrides keep their value and TODO comment whatever Figma says', () => {
  assert.match(CSS, /\/\* TODO\(G04\): Figma neutral\/primary\/on-accent is #0e0f11f2[^]*?\*\/\n {2}--secondary-foreground: var\(--static-light\);/);
  assert.match(CSS, /TODO\(G06\)[^\n]*\n {2}--shadow-color: rgb\(14 15 17 \/ 0\.08\);/);
  assert.match(CSS, /\.dark \[data-brand="koko"\] \{\n {2}\/\* TODO\(G04\): no dark values for koko/);
  const tokens = clone(TOKENS);
  themeVar(tokens, 'neutral/primary/on-accent').light = '#123456';
  themeVar(tokens, 'neutral/negative/container-muted').dark = '#abcdef';
  const css = parseCss(render(buildModel(tokens, MAP), MAP, tokens));
  assert.equal(css.get(':root').get('--secondary-foreground'), 'var(--static-light)');
  assert.equal(css.get('.dark').get('--secondary-foreground'), 'var(--static-light)');
  assert.equal(css.get('.dark').get('--destructive-soft-foreground'), '#abcdef', 'an override to another Figma variable follows it');
  assert.equal(css.get(':root').get('--destructive-soft-foreground'), '#ef4444');
  assert.equal(css.get('.dark[data-brand="koko"], .dark [data-brand="koko"]').get('--brand'), '#da78f2');
});

test('unused Figma variables are info, --strict makes them a failure, map.ignore silences them', () => {
  const tokens = clone(TOKENS);
  tokens.theme.vars.push({ name: 'text/new-role', key: 'k', light: '#000000', dark: '#ffffff', aliasLight: null });
  const path = write('extra.json', tokens);
  const loose = cli('--check', '--tokens', path);
  assert.equal(loose.status, 0, loose.stdout);
  assert.match(loose.stdout, /info: \d+ Figma variable\(s\)\/style\(s\) not used[^]*text\/new-role/);
  assert.equal(cli('--check', '--strict', '--tokens', path).status, 1);
  const map = clone(MAP);
  map.ignore = ['', 'font/*-md'];
  const report = run({ ...DEFAULTS, tokens: path, map: write('map.json', map), from: [], check: true, strict: true });
  assert.equal(report.ok, true, 'everything ignored by the empty prefix');
});

test('shadowCss, colorHex and modeName', () => {
  assert.equal(shadowCss('DROP_SHADOW 0,-2 r2 + 0,0 r1', 'c'), '0 -2px 2px c, 0 0 1px c');
  assert.equal(shadowCss('DROP_SHADOW 0,4 r8 s2', 'c'), '0 4px 8px 2px c');
  assert.throws(() => shadowCss('LAYER_BLUR r4', 'c'), /Unsupported effect/);
  assert.equal(colorHex('#ABC'), '#aabbcc');
  assert.equal(colorHex('#FFFFFFFF'), '#ffffff');
  assert.equal(colorHex({ r: 14 / 255, g: 15 / 255, b: 17 / 255, a: 0.95 }), '#0e0f11f2');
  assert.throws(() => colorHex('red'), /Not a colour/);
  assert.equal(modeName(' Аrtwin '), 'artwin'); // Cyrillic А as in the Figma file
});

// ---- normaliser: a read-tokens.js dump rebuilt from tokens.json must give tokens.json back ----

const rgba = (hex) => {
  const n = (i) => parseInt(hex.slice(i, i + 2), 16) / 255;
  return { r: n(1), g: n(3), b: n(5), a: hex.length === 9 ? n(7) : 1 };
};
const effects = (s) => (s === 'none' ? [] : s.replace(/^DROP_SHADOW /, '').split(' + ').map((p) => {
  const [, x, y, r] = p.match(/^(-?\d+),(-?\d+) r(\d+)$/);
  return { type: 'DROP_SHADOW', visible: true, x: +x, y: +y, radius: +r, spread: 0, color: '#0000001a' };
}));
function dumpsFrom(t) {
  const brandModes = t.brand.modes.map((m) => (m === 'artwin' ? 'Аrtwin' : m));
  const foundation = {
    format: 'mbank-figma-raw/1', kit: 'foundation', file: { name: 'Foundation', key: 'F' }, readAt: '2026-10-30T10:00:00Z',
    collections: [
      { name: '2.theme', key: t.theme.key, modes: ['Light', 'Dark'], variables: t.theme.vars.map((v) => ({
        name: v.name, key: v.key, type: 'COLOR', values: { Light: rgba(v.light), Dark: v.dark.toUpperCase() }, alias: { Light: v.aliasLight, Dark: null } })) },
      { name: '1.brand', key: 'B', modes: brandModes, variables: [
        ...t.brand.vars.map((v) => ({ name: v.name, key: v.key, type: 'COLOR', values: Object.fromEntries(brandModes.map((m, i) => [m, v.values[i]])) })),
        ...t.brandRadius.vars.map((v) => ({ name: v.name, key: v.key, type: 'FLOAT', values: Object.fromEntries(brandModes.map((m) => [m, Number(v.values[0])])) })),
      ] },
      { name: 'Primitives', key: 'P', modes: ['Value'], variables: [{ name: 'green/70 solid', key: 'g', type: 'COLOR', values: { Value: '#16a34a' } }] },
    ],
    textStyles: [], effectStyles: [],
  };
  const web = {
    format: 'mbank-figma-raw/1', kit: 'web', file: { name: 'Web components', key: 'W' }, readAt: '2026-10-31T09:00:00Z',
    collections: [{ name: 'spacing', key: 'S', modes: ['Mode 1'], variables: t.webSpacing.vars.map((v) => ({ name: v.name, key: v.key, type: 'FLOAT', values: { 'Mode 1': Number(v.values[0]) } })) }],
    textStyles: t.textStyles.web.map((s) => ({ ...s })),
    // Web components publishes every shadow twice: the copy must be dropped.
    effectStyles: [...t.effectStyles.web, t.effectStyles.web[1]].map((s) => ({ name: s.name, key: s.key, effects: effects(s.effects) })),
  };
  return [foundation, JSON.stringify({ result: web })];
}

test('normalizeRaw turns read-tokens.js dumps back into the same tokens.json sections', () => {
  const { tokens, updated, skipped, warnings } = normalizeRaw(dumpsFrom(TOKENS), TOKENS);
  for (const section of ['theme', 'brand', 'brandRadius', 'webSpacing']) assert.deepEqual(tokens[section], TOKENS[section], section);
  assert.deepEqual(tokens.textStyles, TOKENS.textStyles);
  assert.deepEqual(tokens.effectStyles, TOKENS.effectStyles);
  for (const kept of ['fonts', 'rem', 'borderRadius', 'mobileFoundation']) assert.deepEqual(tokens[kept], TOKENS[kept], kept);
  assert.deepEqual(Object.keys(tokens), Object.keys(TOKENS), 'same keys in the same order');
  assert.equal(tokens.source, 'read-tokens.js via use_figma: Foundation, Web components (2026-10-31)');
  assert.deepEqual(updated.sort(), ['brand', 'brandRadius', 'effectStyles.web', 'textStyles.web', 'theme', 'webSpacing']);
  assert.deepEqual(skipped, ['Primitives']);
  assert.deepEqual(warnings, []);
  assert.deepEqual(diffTokens(TOKENS, tokens), { changed: [], added: [], removed: [] });
});

test('--from updates tokens.json and tokens.css in one run and lists the Figma changes', () => {
  const tokensPath = write('from-tokens.json', TOKENS);
  const out = join(dir, 'from.css');
  const [foundation, web] = dumpsFrom(TOKENS);
  const theme = foundation.collections[0].variables.find((v) => v.name === 'text/link');
  theme.values.Light = '#2563EB';
  foundation.collections[0].variables.push({ name: 'text/new', key: 'n', type: 'COLOR', values: { Light: '#000', Dark: '#fff' }, alias: {} });
  const raw1 = write('raw-foundation.json', foundation);
  const raw2 = write('raw-web.json', web);

  const dry = cli('--check', '--from', raw1, '--from', raw2, '--tokens', tokensPath, '--out', DEFAULTS.out);
  assert.equal(dry.status, 1, 'tokens.css would change');
  assert.match(dry.stdout, /1 changed, 1 added, 0 removed/);
  assert.match(dry.stdout, /~ theme text\/link \[light\]: #3b82f6 -> #2563eb/);
  assert.match(dry.stdout, /\+ theme text\/new/);
  assert.deepEqual(JSON.parse(readFileSync(tokensPath, 'utf8')), TOKENS, '--check writes nothing');

  const r = cli('--from', raw1, '--from', raw2, '--tokens', tokensPath, '--out', out);
  assert.equal(r.status, 0, r.stdout);
  const next = JSON.parse(readFileSync(tokensPath, 'utf8'));
  assert.equal(themeVar(next, 'text/link').light, '#2563eb');
  assert.equal(parseCss(readFileSync(out, 'utf8')).get(':root').get('--link'), '#2563eb');
  assert.equal(cli('--check', '--tokens', tokensPath, '--out', out).status, 0);
});

test('--from with an unchanged Figma keeps tokens.json byte for byte except the source line', () => {
  const original = readFileSync(DEFAULTS.tokens, 'utf8');
  const tokensPath = write('same-tokens.json', original);
  const [foundation, web] = dumpsFrom(TOKENS);
  const r = cli('--from', write('same-f.json', foundation), '--from', write('same-w.json', web), '--tokens', tokensPath, '--out', join(dir, 'same.css'));
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /0 changed, 0 added, 0 removed; kept from the old file: borderRadius, rem, mobileFoundation/);
  const strip = (s) => s.replace(/\n "source": "[^"]*",/, '');
  assert.equal(strip(readFileSync(tokensPath, 'utf8')), strip(original));
  assert.equal(readFileSync(join(dir, 'same.css'), 'utf8').replace(/ \* Figma read: .*\n/, ''), CSS.replace(/ \* Figma read: .*\n/, ''));
});

test('normalizeRaw rejects files that are not read-tokens.js dumps', () => {
  assert.throws(() => normalizeRaw([{ collections: [] }], TOKENS), /Not a read-tokens\.js dump/);
});

test('compareCss ignores comments, whitespace and declaration order', () => {
  const a = ':root { --a: 1; --b: 2; } /* x */ .dark,.x { --a: 3 }';
  const b = '/* y */\n:root {\n  --b: 2;\n  --a: 1; /* note */\n}\n.dark, .x { --a: 3; }';
  assert.deepEqual(compareCss(a, b), []);
  assert.deepEqual(compareCss(a, b.replace('--a: 3', '--a: 4')), [{ selector: '.dark, .x', css: '--a', figma: null, expected: '3', actual: '4' }]);
});

test('parseArgs', () => {
  const o = parseArgs(['--check', '--strict', '--json', '--from', 'a.json', '--from=b.json', '--out', 'x.css']);
  assert.equal(o.check && o.strict && o.json, true);
  assert.equal(o.from.length, 2);
  assert.ok(o.out.endsWith('x.css'));
  assert.equal(o.tokens, DEFAULTS.tokens);
  assert.throws(() => parseArgs(['--map']), /needs a value/);
  assert.throws(() => parseArgs(['--nope']), /Unknown argument/);
  assert.equal(cli('--nope').status, 2);
});
