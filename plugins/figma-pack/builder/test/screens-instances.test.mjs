// Screens are assembled from instances of the contract component sets: the build first renders the sets the
// spec needs, then every block with a set places instances of it (no detach); a missing set falls back to drawing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createFigma, seedKit } from './figma-mock.mjs';
import { COLOR_TOKENS, EXTENSION_TOKENS } from '../core/tokens.js';

const spec = JSON.parse(readFileSync(new URL('../examples/credit-crm.spec.json', import.meta.url)));
const dir = new URL('../contracts/', import.meta.url);
const BUNDLED = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(new URL(f, dir))));
const NAMES = new Set(BUNDLED.map((c) => c.name));

async function fresh() {
  const m = createFigma();
  globalThis.figma = m.figma;
  await seedKit(m.figma, COLOR_TOKENS.filter((t) => !EXTENSION_TOKENS.includes(t)));
  const brand = await import('../plugin/src/brand.js');
  await brand.setupBrand({ fixNames: true });
  const { vars, radius } = await brand.modeVars();
  const { buildSpec } = await import('../plugin/src/screens.js');
  const { ensureContracts, neededContracts } = await import('../plugin/src/assemble.js');
  const build = (contracts) => buildSpec(spec, { vars, radius, kit: {}, font: 'Inter', prototype: false, contracts });
  return { ...m, build, ensureContracts, neededContracts };
}

const contractOf = (inst) => {
  const main = inst.mainComponent;
  const owner = main && main.parent && main.parent.type === 'COMPONENT_SET' ? main.parent : main;
  return owner ? owner.getPluginData('mbank-contract') : '';
};

test('the credit CRM needs the bundled sets and the new navigation / data contracts', async () => {
  const { neededContracts } = await fresh();
  const need = neededContracts(spec);
  for (const n of ['nav-item', 'breadcrumb-item', 'table-head', 'table-cell', 'crm-kpi-card', 'crm-key-value-row', 'crm-timeline-item', 'crm-application-card', 'progress', 'skeleton', 'alert', 'empty-state', 'pagination', 'tabs-trigger', 'select-trigger', 'textarea']) {
    assert.ok(need.includes(n), `needs ${n}`);
  }
});

test('screens assemble from instances of every bundled contract set; nothing with a set is drawn by hand', async () => {
  const m = await fresh();
  const before = await m.build({});
  const ensured = await m.ensureContracts(spec, BUNDLED);
  assert.deepEqual(ensured.failed, []);
  assert.ok(ensured.built.includes('crm-kpi-card') && ensured.built.includes('table-cell') && ensured.built.includes('button'));
  const comps = m.figma.root.children.find((p) => p.name === 'Components');
  assert.ok(comps.findAll((n) => n.type === 'SECTION').length > 0, 'the kit sheet is laid out');
  const again = await m.ensureContracts(spec, BUNDLED);
  assert.deepEqual(again.built, [], 'present sets are not rebuilt');

  const res = await m.build(ensured.sets);
  for (const [role, r] of Object.entries(res.stats.roles)) {
    if (NAMES.has(role)) assert.equal(r.fallbacks, 0, `${role}: ${r.fallbacks} drawn by hand`);
  }
  // every hand-drawn role is one whose contract is not bundled yet
  for (const { role } of res.handDrawn) assert.ok(!NAMES.has(role), role);
  const frames = await Promise.all(res.frames.map((f) => m.figma.getNodeByIdAsync(f.id)));
  const used = new Map();
  for (const f of frames) for (const i of f.findAll((n) => n.type === 'INSTANCE')) used.set(contractOf(i), (used.get(contractOf(i)) || 0) + 1);
  for (const [role, r] of Object.entries(res.stats.roles)) if (NAMES.has(role) && r.instances) assert.ok(used.get(role) > 0, `instances of ${role} on screens`);
  for (const n of ['button', 'badge', 'avatar', 'checkbox', 'input', 'table-cell', 'crm-kpi-card', 'crm-key-value-row', 'crm-timeline-item', 'crm-application-card', 'progress', 'skeleton', 'alert', 'pagination', 'tabs-trigger', 'select-trigger', 'textarea']) {
    assert.ok(used.get(n) > 0, `${n} placed`);
  }
  assert.ok(res.stats.instances > before.stats.instances * 2, `${before.stats.instances} -> ${res.stats.instances}`);
  assert.ok(res.stats.fallbacks < before.stats.fallbacks / 2, `${before.stats.fallbacks} -> ${res.stats.fallbacks}`);
  console.log(`credit-crm: before instances ${before.stats.instances} / hand ${before.stats.fallbacks}; after instances ${res.stats.instances} / hand ${res.stats.fallbacks}\n  ${res.roles}`);

  // overrides keep the instance linked: KPI texts set by layer name, the cell text, the table-cell width
  const d = frames.find((f) => f.name === '[draft] Обзор / default / 1440');
  const kpi = d.findAll((n) => n.type === 'INSTANCE' && contractOf(n) === 'crm-kpi-card');
  assert.ok(kpi.length >= 3);
  const card = kpi[0];
  const label = card.findOne((n) => n.name === 'Label');
  assert.equal(label.characters, spec.screens.find((s) => s.id === 'dashboard').blocks.find((b) => b.type === 'stats').items[0].label);
  assert.equal(card.layoutSizingHorizontal, 'FIXED');
  assert.equal(new Set(kpi.map((k) => k.width)).size, 1, 'equal card widths in a row');
  const btn = d.findAll((n) => n.type === 'INSTANCE' && contractOf(n) === 'button')[0];
  const key = Object.keys(btn.componentProperties).find((k) => k.startsWith('Label#'));
  assert.ok(btn.componentProperties[key].value.length > 0, 'button label via the «Label» property');
  // the clean audit still holds (instances own their styling)
  const { auditFrames } = await import('../plugin/src/audit.js');
  const audit = await auditFrames(res.frames.map((f) => f.id));
  assert.equal(audit.ok, true, JSON.stringify(audit).slice(0, 400));
});

test('a missing set falls back to drawing and the report names the role', async () => {
  const m = await fresh();
  const ensured = await m.ensureContracts(spec, BUNDLED);
  const { 'crm-kpi-card': gone, ...rest } = ensured.sets;
  assert.ok(gone);
  const res = await m.build(rest);
  assert.ok(res.stats.roles['crm-kpi-card'].fallbacks > 0);
  assert.equal(res.stats.roles['crm-kpi-card'].instances, 0);
  assert.ok(res.handDrawn.some((x) => x.role === 'crm-kpi-card'));
  assert.match(res.roles, /crm-kpi-card 0\/\d+/);
  const d = await m.figma.getNodeByIdAsync(res.frames.find((f) => f.name === '[draft] Обзор / default / 1440').id);
  const stat = d.findOne((n) => n.name.startsWith('Stat / '));
  assert.equal(stat.type, 'FRAME', 'drawn KPI card');
});

test('place(): variant, «Label» property, texts by layer, hidden parts; a font it cannot load falls back', async () => {
  const m = await fresh();
  const ensured = await m.ensureContracts({ ...spec, screens: spec.screens.slice(0, 1) }, BUNDLED);
  const { place } = await import('../plugin/src/place.js');
  const { createCtx } = await import('../plugin/src/draw.js');
  const ctx = { ...createCtx({ vars: {}, radius: {}, font: 'Inter', kit: {} }), sets: ensured.sets };
  const b = await place(ctx, 'button', { props: { variant: 'outline', size: 'sm', state: 'hover' }, label: 'Отчёт' });
  assert.equal(b.type, 'INSTANCE');
  assert.equal(b.mainComponent.name, 'variant=outline, size=sm, state=hover');
  assert.equal(b.findOne((n) => n.type === 'TEXT' && n.name === 'label').characters, 'Отчёт');
  const a = await place(ctx, 'alert', { props: { tone: 'error' }, texts: { Title: null, Description: 'Нет связи' } });
  assert.equal(a.mainComponent.name, 'tone=error');
  assert.equal(a.findOne((n) => n.name === 'title').visible, false);
  assert.equal(a.findOne((n) => n.name === 'description').characters, 'Нет связи');
  assert.equal(await place(ctx, 'no-such-contract', {}), null);
  assert.equal(ctx.stats.roles.button.instances, 1);
});

test('a build leaves nothing loose on section pages (no orphan frames outside the screen sections)', async () => {
  const m = await fresh();
  const ensured = await m.ensureContracts(spec, BUNDLED);
  await m.build(ensured.sets);
  for (const p of m.figma.root.children.filter((x) => !['Components', 'Прототип'].includes(x.name))) {
    const loose = p.children.filter((n) => n.type === 'FRAME' || n.type === 'COMPONENT');
    assert.deepEqual(loose.map((n) => n.name), [], `page ${p.name}`);
  }
});
