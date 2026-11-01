// Pure logic of the Mbank Tokens widget: board model, contrast, extra tokens, brand generator,
// status against a file scan, apply plan, exports and import. No Figma.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { buildModel, counters, BRANDS, normHex } from '../core/model.js';
import { contrastIssues, validateExtra, normalizeExtra } from '../core/checks.js';
import { generateBrand, brandEdits, BRAND_SLOTS } from '../core/brand-gen.js';
import { statusOf, fileStatus, planWrites, planAllBrands } from '../core/sync.js';
import { exportTokensJson, rawDump, registryBase, tokensCss, syncCommands } from '../core/exports.js';
import { importTokens, editedContracts, bindingTable } from '../core/io.js';
import { contrast } from '../../builder/core/color.js';
import { TOKEN_MAP } from '../../builder/core/token-map.js';

const TOKENS = JSON.parse(readFileSync(new URL('../../skills/mbank-figma-patterns/references/tokens.json', import.meta.url)));
const CONTRACTS = readdirSync(new URL('../../builder/contracts/', import.meta.url)).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(new URL(`../../builder/contracts/${f}`, import.meta.url))));
const row = (model, css) => model.rows.find((r) => r.css === css);

test('board model: every mapped CSS token with its Figma variable and values for the brand', () => {
  const bank = buildModel(TOKENS, { brand: 'bank' });
  const mapped = Object.values(TOKEN_MAP.colors).filter((m) => m.figma).length + Object.keys(TOKEN_MAP.radius).length;
  assert.equal(bank.rows.length, mapped);
  assert.ok(bank.rows.every((r) => r.light != null && r.dark != null), 'every row has light and dark');
  assert.deepEqual(row(bank, 'primary'), { ...row(bank, 'primary'), figma: 'accent/primary/default', collection: '2.theme', group: 'accent', edited: false });
  assert.equal(row(bank, 'brand').light, '#16a34a');
  assert.equal(row(bank, 'brand').figma, 'brand/default');
  const kassa = buildModel(TOKENS, { brand: 'kassa' });
  assert.equal(row(kassa, 'brand').light, '#2563eb');
  assert.equal(row(kassa, 'brand').dark, '#3b82f6', 'dark from 2.theme brand/kassa/default');
  assert.equal(row(kassa, 'brand').key, 'kassa:brand');
  const koko = buildModel(TOKENS, { brand: 'koko' });
  assert.match(row(koko, 'brand').note, /G04/);
  assert.equal(row(koko, 'brand').dark, row(koko, 'brand').light);
  assert.equal(row(bank, 'radius-md').light, 12);
  const c = counters(bank, contrastIssues(bank.rows));
  assert.equal(c.tokens, mapped);
  assert.equal(c.edited, 0);
});

test('edits and extra tokens: edited flag, per-brand keys, counters', () => {
  const edits = { primary: { light: '#7C3AED', dark: '#8b5cf6' }, 'kassa:brand': { light: '#7c3aed', dark: '#8b5cf6' } };
  const extras = [{ name: 'mb-promo-surface', kind: 'color', light: '#fef3c7', dark: '#451a03' }, { name: 'mb-promo-foreground', kind: 'color', light: '#451a03', dark: '#fef3c7', pairWith: 'mb-promo-surface' }];
  const bank = buildModel(TOKENS, { brand: 'bank', edits, extras });
  assert.equal(row(bank, 'primary').edited, true);
  assert.equal(row(bank, 'brand').edited, false, 'kassa edit does not touch bank');
  assert.equal(buildModel(TOKENS, { brand: 'kassa', edits }).rows.find((r) => r.css === 'brand').light, '#7c3aed');
  assert.deepEqual([row(bank, 'brand-kassa').light, row(bank, 'brand-kassa').derivedFrom], ['#7c3aed', 'kassa:brand'], '2.theme brand/kassa/default follows the kassa brand edit');
  const x = row(bank, 'mb-promo-surface');
  assert.equal(x.figma, 'custom/mb/promo-surface');
  assert.equal(x.group, 'extra');
  assert.equal(counters(bank).extras, 2);
  assert.equal(buildModel(TOKENS, { edits: { primary: { light: '#FDDB2B', dark: '#f7c21c' } } }).rows.find((r) => r.css === 'primary').edited, false, 'same value in another case is not an edit');
  const pair = contrastIssues(bank.rows).filter((i) => i.fg === 'mb-promo-foreground');
  assert.equal(pair.length, 2);
  assert.ok(pair.every((i) => i.ok && i.bg === 'mb-promo-surface'));
});

test('contrast: real AA failures of the source are found, a fixed pair passes', () => {
  const bank = buildModel(TOKENS, { brand: 'bank' });
  const failing = contrastIssues(bank.rows).filter((i) => !i.ok);
  assert.ok(failing.some((i) => i.fg === 'destructive-foreground' && i.bg === 'destructive'));
  // G04: Figma's neutral/primary/on-accent is dark on dark; the token follows the code workaround (static/light).
  assert.ok(!failing.some((i) => i.fg === 'secondary-foreground'));
  const fixed = buildModel(TOKENS, { edits: { 'destructive-foreground': { light: '#ffffff', dark: '#ffffff' }, destructive: { light: '#b91c1c', dark: '#b91c1c' } } });
  assert.ok(contrastIssues(fixed.rows).filter((i) => i.fg === 'destructive-foreground' && i.bg === 'destructive').every((i) => i.ok));
});

test('extra token validation (Russian errors) and normalisation', () => {
  const taken = new Set(['primary', 'mb-taken']);
  const ok = { name: 'mb-promo-surface', kind: 'color', light: '#FEF3C7', dark: '' };
  assert.deepEqual(validateExtra(ok, 'mb', taken), []);
  assert.deepEqual(normalizeExtra(ok), { name: 'mb-promo-surface', kind: 'color', light: '#fef3c7', dark: '#fef3c7' });
  assert.match(validateExtra({ ...ok, name: 'MbPromo' }, 'mb', taken).join(), /kebab-case/);
  assert.match(validateExtra({ ...ok, name: 'xx-promo' }, 'mb', taken).join(), /префикса «mb-»/);
  assert.match(validateExtra({ ...ok, name: 'mb-taken' }, 'mb', taken).join(), /уже есть/);
  assert.match(validateExtra({ ...ok, light: 'red' }, 'mb', taken).join(), /не цвет/);
  assert.match(validateExtra({ ...ok, prefix: 'x' }, 'M B', taken).join(), /Префикс/);
  assert.deepEqual(validateExtra({ name: 'mb-card-radius', kind: 'radius', light: '1rem', dark: '' }, 'mb', taken), []);
  assert.equal(normalizeExtra({ name: 'mb-card-radius', kind: 'radius', light: '1rem' }).light, 16);
  assert.match(validateExtra({ name: 'mb-gap', kind: 'size', light: '12 px' }, 'mb', taken).join(), /длина/);
  assert.deepEqual(validateExtra({ ...ok, light: 'var(--primary)' }, 'mb', taken), []);
});

test('brand from one colour: 12 slots, readable text, edits for that brand only', () => {
  for (const hex of ['#7c3aed', '#fddb2b', '#16a34a']) {
    const g = generateBrand(hex);
    for (const mode of ['light', 'dark']) {
      assert.deepEqual(Object.keys(g[mode]), BRAND_SLOTS);
      assert.ok(Object.values(g[mode]).every((v) => normHex(v)), `${hex} ${mode}: hex values`);
    }
    assert.ok(contrast(g.light['on-accent'], g.light.default) >= 4.5, `${hex}: on-accent readable`);
    assert.ok(contrast(g.light['ghost-on-accent'], g.light['ghost-default']) >= 4.5, `${hex}: ghost text readable`);
  }
  assert.throws(() => generateBrand('purple'));
  const rows = buildModel(TOKENS, { brand: 'travel' }).rows;
  const edits = brandEdits(rows, 'travel', generateBrand('#7c3aed'));
  assert.equal(Object.keys(edits).length, 12);
  assert.ok(Object.keys(edits).every((k) => k.startsWith('travel:brand')));
});

test('status against a file scan and the apply plan', () => {
  const model = buildModel(TOKENS, { brand: 'kassa', edits: { primary: { light: '#7c3aed', dark: '#8b5cf6' } }, extras: [{ name: 'mb-x', kind: 'color', light: 'var(--primary)', dark: '#000000' }] });
  assert.equal(statusOf(row(model, 'primary'), null), 'unknown');
  const snapshot = { vars: {
    '2.theme/accent/primary/default': { light: '#fddb2b', dark: '#f7c21c' },
    '2.theme/text/default': { light: row(model, 'foreground').light.toUpperCase(), dark: row(model, 'foreground').dark },
    '1.brand/brand/default': { bank: '#16a34a', kassa: '#2563eb' },
    '2.theme/brand/kassa/default': { light: '#2563eb', dark: '#3b82f6' },
  }, library: { '2.theme/text/muted': true } };
  assert.equal(statusOf(row(model, 'primary'), snapshot), 'differs');
  assert.equal(statusOf(row(model, 'foreground'), snapshot), 'bound');
  assert.equal(statusOf(row(model, 'brand'), snapshot), 'bound');
  assert.equal(statusOf(row(model, 'muted-foreground'), snapshot), 'library');
  assert.equal(statusOf(row(model, 'border'), snapshot), 'missing');
  assert.equal(fileStatus(model.rows, snapshot).totals.bound, 3, 'foreground, brand, brand-kassa (2.theme brand/kassa/default)');

  const { writes, skipped } = planWrites(model);
  assert.deepEqual(skipped, []);
  assert.deepEqual(writes.map((w) => `${w.collection}/${w.name}`), ['2.theme/accent/primary/default', '2.theme/custom/mb/x']);
  assert.deepEqual(writes[1].values.light, { aliasOf: { collection: '2.theme', name: 'accent/primary/default' } });
  assert.deepEqual(writes[0].scopes, ['FRAME_FILL', 'SHAPE_FILL']);
  const bad = planWrites(buildModel(TOKENS, { extras: [{ name: 'mb-y', kind: 'color', light: 'var(--nope)' }] }));
  assert.match(bad.skipped[0].reason, /нет/);
  const all = planAllBrands((b) => buildModel(TOKENS, { brand: b }), BRANDS, { all: true });
  const brandDefault = all.writes.filter((w) => w.collection === '1.brand' && w.name === 'brand/default');
  assert.deepEqual(brandDefault.map((w) => Object.keys(w.values)[0]), BRANDS, 'brand/default once per brand mode');
  assert.equal(all.writes.filter((w) => w.name === 'accent/primary/default').length, 1, '2.theme rows once');
  assert.ok(all.writes.some((w) => w.name === 'radius/m' && w.type === 'FLOAT' && w.values['*'] === 12));
});

test('exports: tokens.json round-trips through import, raw dump, registry:base, tokens.css', () => {
  const state = {
    edits: { primary: { light: '#7c3aed', dark: '#8b5cf6' }, 'koko:brand': { light: '#db2777', dark: '#ec4899' }, 'radius-md': { light: 10, dark: 10 } },
    extras: [{ name: 'mb-promo', kind: 'color', light: 'var(--primary)', dark: '#111111' }, { name: 'mb-gap', kind: 'size', light: 6, dark: 6 }],
  };
  const json = exportTokensJson(TOKENS, state);
  assert.equal(json.theme.vars.find((v) => v.name === 'accent/primary/default').light, '#7c3aed');
  assert.equal(json.theme.vars.find((v) => v.name === 'accent/primary/default').aliasLight, null, 'alias dropped when the value changed');
  assert.equal(json.brand.vars.find((v) => v.name === 'brand/default').values[4], '#db2777');
  assert.equal(json.theme.vars.find((v) => v.name === 'brand/koko/default').dark, '#ec4899', 'koko dark now exists');
  assert.equal(json.brandRadius.vars.find((v) => v.name === 'radius/m').values[0], '10');
  const promo = json.theme.vars.find((v) => v.name === 'custom/mb/promo');
  assert.deepEqual([promo.light, promo.dark, promo.aliasLight], ['#7c3aed', '#111111', 'accent/primary/default']);
  assert.equal(json.theme.vars.find((v) => v.name === 'custom/mb/gap').light, '6');
  assert.deepEqual(exportTokensJson(TOKENS, {}), TOKENS, 'no edits: identical to the source');

  const back = importTokens(TOKENS, JSON.stringify(json));
  assert.deepEqual(back.errors, []);
  assert.deepEqual(back.edits.primary, state.edits.primary);
  assert.deepEqual(back.edits['koko:brand'], state.edits['koko:brand']);
  assert.equal(back.edits['radius-md'].light, 10);
  assert.deepEqual(back.extras.map((x) => [x.name, x.kind]), [['mb-promo', 'color'], ['mb-gap', 'size']]);
  assert.match(importTokens(TOKENS, '{').errors[0], /Не JSON/);
  assert.match(importTokens(TOKENS, rawDump(TOKENS)).errors[0], /сырой дамп/);

  const raw = rawDump(json, { date: '2026-11-01T00:00:00Z' });
  assert.equal(raw.format, 'mbank-figma-raw/1');
  const [theme, brand] = raw.collections;
  assert.deepEqual([theme.name, brand.name, brand.modes], ['2.theme', '1.brand', BRANDS]);
  assert.equal(theme.variables.find((v) => v.name === 'custom/mb/gap').type, 'FLOAT');
  assert.equal(brand.variables.find((v) => v.name === 'brand/default').values.koko, '#db2777');
  assert.equal(brand.variables.find((v) => v.name === 'radius/m').values.bank, 10);

  const model = buildModel(TOKENS, { brand: 'koko', ...state });
  const item = registryBase(model);
  checkRegistryItem(item);
  assert.equal(item.cssVars.light.primary, '#7c3aed');
  assert.equal(item.cssVars.light['mb-promo'], '#7c3aed', 'var() resolved for the registry');
  assert.equal(item.cssVars.light['card-foreground'], 'var(--foreground)', 'code-only aliases kept');
  assert.equal(item.cssVars.light.radius, '10px');
  const css = tokensCss(model);
  for (const part of [':root {', '.dark {', '@theme inline {', '--color-primary: var(--primary);', '--brand: #db2777;', '--mb-gap: 6px;', '--radius-md: var(--radius-md);']) assert.ok(css.includes(part), part);
  assert.match(syncCommands({ contracts: ['button'] }).map((c) => c.cmd).join('\n'), /sync-contracts\.mjs[\s\S]*contract-to-code\.mjs/);
});

// Required shape of https://ui.shadcn.com/schema/registry-item.json for registry:base (vendored in
// apps/ds-configurator/src/upstream/registry-item.schema.json): name, type enum, cssVars of strings.
function checkRegistryItem(item) {
  assert.equal(item.$schema, 'https://ui.shadcn.com/schema/registry-item.json');
  assert.equal(typeof item.name, 'string');
  assert.equal(item.type, 'registry:base');
  for (const k of ['title', 'description']) assert.equal(typeof item[k], 'string');
  assert.deepEqual(Object.keys(item.cssVars).sort(), ['dark', 'light', 'theme']);
  for (const [group, vars] of Object.entries(item.cssVars)) {
    for (const [k, v] of Object.entries(vars)) assert.equal(typeof v, 'string', `cssVars.${group}.${k}`);
  }
  assert.equal(typeof item.meta, 'object');
  for (const banned of ['font', 'style', 'iconLibrary', 'baseColor']) assert.equal(item[banned], undefined, banned);
}

test('contract bindings: table rows, edited contracts stay valid', () => {
  const button = CONTRACTS.find((c) => c.name === 'button');
  const rows = bindingTable(button);
  assert.ok(rows.length > 5 && rows.every((r) => ['color', 'radius', 'space'].includes(r.kind)));
  assert.ok(rows.some((x) => x.prop === 'px' && typeof x.value === 'number'), 'padding rows are bindable too');
  const r = rows.find((x) => x.prop === 'bg');
  const edited = editedContracts(CONTRACTS, [{ contract: 'button', path: r.path, key: r.key, value: 'brand' }]);
  assert.equal(edited.length, 1);
  assert.deepEqual(edited[0].errors, []);
  assert.equal(r.path.reduce((o, k) => o[k], edited[0].contract)[r.key], 'brand');
  const removed = editedContracts(CONTRACTS, [{ contract: 'button', path: r.path, key: r.key, value: null }]);
  assert.equal(r.path.reduce((o, k) => o[k], removed[0].contract)[r.key], undefined);
});
