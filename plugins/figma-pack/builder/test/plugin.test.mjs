import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createFigma, seedKit } from './figma-mock.mjs';
import { COLOR_TOKENS, RADIUS_TOKENS, radiusScale, rgbaOf } from '../core/tokens.js';

const spec = JSON.parse(readFileSync(new URL('./fixtures/credit-crm-mini.spec.json', import.meta.url)));

async function fresh() {
  const m = createFigma();
  globalThis.figma = m.figma;
  const variables = await import('../plugin/src/variables.js');
  return { ...m, variables };
}

test('ensureShadcn: one collection «shadcn» with Light/Dark, every shadcn name, canonical values; idempotent', async () => {
  const m = await fresh();
  const before = await m.variables.inspect();
  assert.equal(before.collection, false);
  assert.equal(before.missing.length, COLOR_TOKENS.length + 1);
  const r = await m.variables.ensureShadcn();
  assert.equal(r.collection, true);
  assert.deepEqual(r.created.sort(), [...COLOR_TOKENS, ...RADIUS_TOKENS].sort());
  const ix = await m.variables.loadIndex();
  assert.deepEqual(Object.keys(ix.col), ['shadcn'], 'no Brand, Mode, Style or library collections');
  const col = ix.col.shadcn;
  assert.deepEqual(col.modes.map((x) => x.name), ['Light', 'Dark']);
  const [light, dark] = col.modes.map((x) => x.modeId);
  const primary = ix.named.shadcn.get('primary');
  assert.deepEqual(primary.valuesByMode[light], rgbaOf('primary', 'light'));
  assert.deepEqual(primary.valuesByMode[dark], rgbaOf('primary', 'dark'));
  assert.equal(ix.named.shadcn.get('border').valuesByMode[dark].a, 0.1, 'alpha from oklch(1 0 0 / 10%)');
  assert.equal(primary.codeSyntax.WEB, 'var(--primary)');
  assert.deepEqual(primary.scopes, ['FRAME_FILL', 'SHAPE_FILL']);
  assert.equal(ix.named.shadcn.get('radius').valuesByMode[light], 10);
  assert.equal(ix.named.shadcn.get('radius-xl').valuesByMode[dark], radiusScale().xl);
  assert.deepEqual(ix.named.shadcn.get('radius-md').scopes, ['CORNER_RADIUS']);
  const after = await m.variables.inspect();
  assert.deepEqual(after.missing, []);
  assert.equal(after.colors, 31);

  // a designer edits a value: a plain re-run keeps it, reset restores the canonical one
  primary.setValueForMode(light, { r: 1, g: 0, b: 0, a: 1 });
  const again = await m.variables.ensureShadcn();
  assert.deepEqual(again.created, []);
  assert.deepEqual(primary.valuesByMode[light], { r: 1, g: 0, b: 0, a: 1 });
  const read = await m.variables.readShadcn();
  assert.equal(read.colors.primary.light, 'oklch(0.628 0.258 29.234)', 'export reads the edited value as oklch');
  assert.equal(read.colors.primary.dark, 'oklch(0.922 0 0)');
  assert.equal(read.radius, '0.625rem');
  assert.deepEqual(read.missing, []);
  const reset = await m.variables.ensureShadcn({ reset: true });
  assert.equal(reset.reset, COLOR_TOKENS.length);
  assert.deepEqual(primary.valuesByMode[light], rgbaOf('primary', 'light'));
});

test('builds the example spec: all blocks, states and viewports, audit clean', async () => {
  const m = await fresh();
  await seedKit(m.figma);
  const { modeVars } = m.variables;
  const { buildSpec } = await import('../plugin/src/screens.js');
  const { auditFrames } = await import('../plugin/src/audit.js');
  const { framePlan } = await import('../core/spec.js');
  const { vars, radius } = await modeVars();
  assert.ok(Object.values(vars).every(Boolean), 'every token has a shadcn variable');
  let progress = 0;
  const res = await buildSpec(spec, { vars, radius, kit: {}, font: 'Inter', theme: 'dark' }, () => progress++);
  assert.equal(res.frames.length, framePlan(spec).length);
  assert.equal(progress, res.frames.length);
  assert.equal(res.fallbackFonts, true, 'kit style font (Inter Mbank) missing -> fallback styles');
  const audit = await auditFrames(res.frames.map((f) => f.id));
  assert.equal(audit.ok, true, JSON.stringify(audit));
  const f = await m.figma.getNodeByIdAsync(res.frames[0].id);
  const col = [...m.cols.values()].find((c) => c.name === 'shadcn');
  assert.deepEqual(f.explicitModes, { [col.id]: col.modes[1].modeId }, 'the Dark mode of shadcn pinned');
  const again = await buildSpec(spec, { vars, radius, kit: {}, font: 'Inter', only: ['apps'] });
  const pages = m.figma.root.children.find((p) => p.name === 'Заявки');
  assert.equal(pages.children.filter((n) => n.name === 'Кредитный конвейер / Заявки').length, 1, 'rebuild replaces the section');
  assert.equal(again.frames.length, 8);
});

test('stat cards hug their content in height (Figma resize() fixes both axes)', async () => {
  const { createFigma } = await import('./figma-mock.mjs');
  globalThis.figma = createFigma({ missingFonts: [] }).figma;
  const { createCtx, loadFonts } = await import('../plugin/src/draw.js');
  const { stats } = await import('../plugin/src/blocks-data.js');
  const font = await loadFonts('Inter');
  const ctx = { ...createCtx({ vars: {}, radius: {}, font, kit: {} }), vp: 'desktop', state: 'default', width: 1100 };
  const row = await stats(ctx, { type: 'stats', items: [{ label: 'Новых заявок', value: '86' }, { label: 'Одобрено', value: '64%' }] });
  const card = row.children[0];
  assert.equal(card.primaryAxisSizingMode, 'AUTO', 'height hugs the label, value and delta');
  assert.equal(card.counterAxisSizingMode, 'FIXED', 'width is the column width');
});
