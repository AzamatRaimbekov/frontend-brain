// The navigation / data contracts that land next (nav-item, breadcrumb-item, table-head, stepper-step, empty-state,
// crm-list-item, filter-chip, search-input, date-picker-trigger): minimal stand-ins with the agreed parts, layer
// names and variant props prove the screen mapping places them the moment the real contracts are bundled.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createFigma, seedKit } from './figma-mock.mjs';
import { COLOR_TOKENS, EXTENSION_TOKENS } from '../core/tokens.js';
import { validateContract } from '../core/contract.js';

const spec = JSON.parse(readFileSync(new URL('../examples/credit-crm.spec.json', import.meta.url)));
const dir = new URL('../contracts/', import.meta.url);
const BUNDLED = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(new URL(f, dir))));

const row = { layout: 'row', align: 'center', gap: 2, px: 3, height: 9, text: 'sm', fg: 'foreground' };
const contract = (name, title, parts, extra = {}) => ({ $schema: 'mbank/component@1', name, title, parts: ['root', ...parts], props: {}, variants: {}, base: { root: row }, states: ['default'], ...extra });
const prop = (values) => ({ values, default: values[0] });
const NEXT = [
  contract('nav-item', 'Nav item', ['icon', 'label', 'count'], { states: ['default', 'hover', 'selected', 'disabled'], anatomy: { label: { layer: 'Label' }, count: { kind: 'text', layer: 'Count', sample: '0' } } }),
  contract('breadcrumb-item', 'Breadcrumb item', ['label', 'separator'], { props: { current: prop(['false', 'true']) }, variants: { current: { false: {}, true: { separator: { hidden: true } } } }, anatomy: { label: { layer: 'Label' }, separator: { kind: 'text', layer: 'Separator', sample: '/' } } }),
  contract('table-head', 'Table head', ['text', 'icon'], { props: { sort: prop(['none', 'asc', 'desc']) }, variants: { sort: { none: { icon: { hidden: true } }, asc: {}, desc: {} } }, anatomy: { text: { layer: 'Text' } } }),
  contract('stepper-step', 'Stepper step', ['marker', 'number', 'label', 'description'], { props: { status: prop(['done', 'current', 'upcoming']) }, variants: { status: { done: {}, current: {}, upcoming: {} } }, anatomy: { marker: { kind: 'frame', layer: 'Marker' }, number: { kind: 'text', layer: 'Number', parent: 'marker' }, label: { layer: 'Label' }, description: { layer: 'Description' } } }),
  contract('empty-state', 'Empty state', ['icon', 'title', 'description', 'action'], { base: { root: { ...row, layout: 'column' } }, anatomy: { title: { layer: 'Title' }, description: { layer: 'Description' }, action: { kind: 'instance', layer: 'Action', component: { name: 'Button' } } } }),
  contract('crm-list-item', 'CRM / List item', ['avatar', 'content', 'title', 'subtitle', 'meta'], { anatomy: { avatar: { kind: 'instance', layer: 'Avatar', component: { name: 'Avatar' } }, content: { kind: 'frame', layer: 'Content' }, title: { kind: 'text', layer: 'Title', parent: 'content' }, subtitle: { kind: 'text', layer: 'Subtitle', parent: 'content' }, meta: { kind: 'text', layer: 'Meta' } } }),
  contract('filter-chip', 'Filter chip', ['label', 'icon'], { states: ['default', 'hover', 'selected'], anatomy: { label: { layer: 'Label' } } }),
  contract('search-input', 'Search input', ['icon', 'placeholder'], { states: ['default', 'hover', 'focus', 'disabled'], anatomy: { placeholder: { layer: 'Placeholder' } } }),
  contract('date-picker-trigger', 'Date picker trigger', ['placeholder', 'icon'], { states: ['default', 'hover', 'focus', 'disabled'], anatomy: { placeholder: { layer: 'Placeholder' } } }),
];

test('stand-in contracts are valid', () => {
  for (const c of NEXT) assert.deepEqual(validateContract(c), [], c.name);
});

test('with the next contracts in the file, screens draw nothing by hand', async () => {
  const m = createFigma();
  globalThis.figma = m.figma;
  await seedKit(m.figma, COLOR_TOKENS.filter((t) => !EXTENSION_TOKENS.includes(t)));
  const brand = await import('../plugin/src/brand.js');
  await brand.setupBrand({ fixNames: true });
  const { vars, radius } = await brand.modeVars();
  const { buildSpec } = await import('../plugin/src/screens.js');
  const { ensureContracts } = await import('../plugin/src/assemble.js');
  const ensured = await ensureContracts(spec, [...BUNDLED, ...NEXT]);
  assert.deepEqual(ensured.failed, []);
  assert.deepEqual(ensured.unknown, ['radio', 'tabbar-item'].filter((n) => ensured.unknown.includes(n)), `only roles the CRM spec never places: ${ensured.unknown}`);
  const res = await buildSpec(spec, { vars, radius, kit: {}, font: 'Inter', prototype: false, contracts: ensured.sets });
  assert.deepEqual(res.handDrawn, [], res.roles);
  for (const n of NEXT.map((c) => c.name)) assert.ok(res.stats.roles[n] && res.stats.roles[n].instances > 0, `${n} placed: ${res.roles}`);

  const frame = async (title) => m.figma.getNodeByIdAsync(res.frames.find((f) => f.name === title).id);
  const d = await frame('[draft] Обзор / default / 1440');
  const nav = d.findOne((n) => n.name === 'Nav / Обзор');
  assert.equal(nav.type, 'INSTANCE');
  assert.equal(nav.mainComponent.name, 'state=selected', 'the active section is selected');
  const apps = d.findOne((n) => n.name === 'Nav / Заявки');
  assert.equal(apps.mainComponent.name, 'state=default');
  assert.equal(apps.findOne((n) => n.name === 'Count').characters, '24', 'the counter in the count part');
  assert.equal(apps.findOne((n) => n.name === 'Count').visible, true);
  assert.equal(nav.findOne((n) => n.name === 'Count').visible, false, 'no counter, no count part');
  assert.ok(apps.getPluginData('mbank-link'), 'nav instance carries the prototype link');

  const card = await frame('[draft] Заявка CL-240118 / default / 1440');
  const crumbs = card.findOne((n) => n.name === 'Breadcrumbs').children;
  assert.ok(crumbs.length >= 2 && crumbs.every((c) => c.type === 'INSTANCE'));
  assert.equal(crumbs.at(-1).mainComponent.name, 'current=true');
  assert.equal(crumbs[0].mainComponent.name, 'current=false');

  const list = await frame('[draft] Заявки / default / 1440');
  const head = list.findAll((n) => n.name.startsWith('Head / '));
  assert.ok(head.length && head.every((h) => h.type === 'INSTANCE' && h.mainComponent.name === 'sort=none'));
});
