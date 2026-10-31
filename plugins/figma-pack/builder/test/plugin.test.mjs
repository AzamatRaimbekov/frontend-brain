import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createFigma, seedKit } from './figma-mock.mjs';
import { COLOR_TOKENS, EXTENSION_TOKENS, generateTokens, BRAND_KEYS } from '../core/tokens.js';

const KIT_TOKENS = COLOR_TOKENS.filter((t) => !EXTENSION_TOKENS.includes(t));
const spec = JSON.parse(readFileSync(new URL('../examples/credit-crm.spec.json', import.meta.url)));

async function fresh() {
  const m = createFigma();
  globalThis.figma = m.figma;
  const seeded = await seedKit(m.figma, KIT_TOKENS);
  const brand = await import('../plugin/src/brand.js');
  return { ...m, ...seeded, brand };
}

const target = (m, v, modeId) => m.vars.get(v.valuesByMode[modeId].id);

test('setup inserts Brand between Style and Mode and fixes names', async () => {
  const m = await fresh();
  const before = await m.brand.inspect();
  assert.equal(before.brands.length, 0);
  assert.equal(before.legacyNames.length, 1);
  const r = await m.brand.setupBrand({ fixScopes: true, fixNames: true });
  assert.equal(r.renamed, 1);
  assert.deepEqual(r.extensions.sort(), [...EXTENSION_TOKENS].sort());
  const ix = await m.brand.loadIndex();
  const brandCol = ix.col.Brand;
  const primary = ix.named.Mode.get('primary');
  const bv = target(m, primary, m.mode.defaultModeId);
  assert.equal(bv.variableCollectionId, brandCol.id);
  assert.equal(bv.name, 'color/light/primary');
  assert.equal(target(m, bv, brandCol.defaultModeId).variableCollectionId, m.style.id, 'Brand inherits Style');
  assert.ok(ix.named.Mode.has('custom/mmarket/badge-bg-slate'));
  assert.deepEqual(primary.scopes, ['FRAME_FILL', 'SHAPE_FILL']);
  assert.equal(primary.codeSyntax.WEB, 'var(--primary)');
  const after = await m.brand.inspect();
  assert.equal(after.migrated, after.total);
  assert.deepEqual(after.missingExtensions, []);
  const again = await m.brand.setupBrand({ fixScopes: true, fixNames: true });
  assert.equal(again.linked, 0, 'idempotent');
});

test('brands, applying a theme with Tailwind snapping, custom tokens, rollback', async () => {
  const m = await fresh();
  await m.brand.setupBrand({ fixNames: true });
  await m.brand.addBrand('MMarket');
  await assert.rejects(m.brand.addBrand('MMarket'));
  const tokens = generateTokens({ name: 'MMarket', brand: '#ffb900' });
  tokens.font.heading = 'Roboto';
  const rows = await m.brand.applyBrand('MMarket', tokens, BRAND_KEYS, { reset: true });
  assert.ok(rows.find((r) => r.token === 'primary' && r.theme === 'light').alias === 'amber/400', 'primary snapped to amber/400');
  const table = await m.brand.readBrand('MMarket', 'Nova');
  const prim = table.rows.find((r) => r.token === 'primary' && r.theme === 'light');
  assert.equal(prim.inherited, false);
  assert.equal(prim.hex, '#ffb900');
  const bg = table.rows.find((r) => r.token === 'background' && r.theme === 'light');
  assert.equal(bg.inherited, true, 'untouched tokens inherit the style');
  const base = await m.brand.readBrand('Base', 'Nova');
  assert.equal(base.rows.find((r) => r.token === 'primary' && r.theme === 'light').inherited, true, 'Base brand untouched');

  const t = await m.brand.addCustomToken({ project: 'mmarket', role: 'badge-bg-orange', light: 'amber/400', dark: '#7e2a0c' });
  assert.equal(t.css, '--mmarket-badge-bg-orange');
  await assert.rejects(m.brand.addCustomToken({ project: 'mmarket', role: 'x', light: 'nope/1' }));
  const custom = await m.brand.resolveCustom('MMarket', 'Nova');
  assert.deepEqual(custom['mmarket-badge-bg-orange'], { light: '#ffb900', dark: '#7e2a0c' });

  const r = await m.brand.rollbackBrand();
  assert.ok(r.restored > 0);
  const ix = await m.brand.loadIndex();
  assert.equal(ix.col.Brand, undefined);
  assert.equal(target(m, ix.named.Mode.get('primary'), m.mode.defaultModeId).variableCollectionId, m.style.id);
  assert.equal(ix.named.Mode.has('success'), false, 'extensions removed');
});

test('builds the example spec: all blocks, states and viewports, audit clean', async () => {
  const m = await fresh();
  await m.brand.setupBrand({ fixNames: true });
  await m.brand.addBrand('MMarket');
  const { modeVars } = m.brand;
  const { buildSpec } = await import('../plugin/src/screens.js');
  const { auditFrames } = await import('../plugin/src/audit.js');
  const { framePlan } = await import('../core/spec.js');
  const { vars, radius } = await modeVars();
  assert.ok(Object.values(vars).every(Boolean), 'every token has a Mode variable');
  let progress = 0;
  const res = await buildSpec(spec, { vars, radius, kit: {}, font: 'Inter', brand: 'MMarket', style: 'Nova', theme: 'dark' }, () => progress++);
  assert.equal(res.frames.length, framePlan(spec).length);
  assert.equal(progress, res.frames.length);
  assert.equal(res.fallbackFonts, true, 'kit style font (Inter Mbank) missing -> fallback styles');
  const audit = await auditFrames(res.frames.map((f) => f.id));
  assert.equal(audit.ok, true, JSON.stringify(audit));
  const f = await m.figma.getNodeByIdAsync(res.frames[0].id);
  assert.equal(Object.keys(f.explicitModes).length, 3, 'brand, style and theme pinned');
  const again = await buildSpec(spec, { vars, radius, kit: {}, font: 'Inter', only: ['apps'] });
  const pages = m.figma.root.children.find((p) => p.name === 'Заявки');
  assert.equal(pages.children.filter((n) => n.name === 'Кредитный конвейер / Заявки').length, 1, 'rebuild replaces the section');
  assert.equal(again.frames.length, 8);
});
