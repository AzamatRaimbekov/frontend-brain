// All bundled contracts (builder/contracts/*.json) through «Собрать все» (contract-render-all) on the mocked kit:
// every contract is valid, builds, lands in its kit-sheet group, and nested kit instances resolve to our own sets.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createFigma, seedKit } from './figma-mock.mjs';
import { COLOR_TOKENS, EXTENSION_TOKENS } from '../core/tokens.js';
import { validateContract, partKind } from '../core/contract.js';
import { GROUPS } from '../plugin/src/kit-sheet.js';

const dir = new URL('../contracts/', import.meta.url);
const ALL = readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(new URL(f, dir))));
const byName = (n) => ALL.find((c) => c.name === n);
const KIT_TOKENS = COLOR_TOKENS.filter((t) => !EXTENSION_TOKENS.includes(t));

const NEW = ['nav-item', 'tabbar-item', 'breadcrumb-item', 'search-input', 'filter-chip', 'radio', 'date-picker-trigger', 'dropdown-menu-item', 'table-head', 'crm-list-item', 'stepper-step', 'empty-state', 'toast', 'tooltip', 'dialog', 'spinner', 'separator'];
const sentence = (part) => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');

async function kit() {
  const m = createFigma();
  globalThis.figma = m.figma;
  await seedKit(m.figma, KIT_TOKENS);
  const brand = await import('../plugin/src/brand.js');
  await brand.setupBrand({ fixNames: true });
  const { contractHandlers } = await import('../plugin/src/contracts.js');
  return { ...m, handlers: contractHandlers(ALL) };
}

test('38 contracts, all valid; the 17 added ones are there', () => {
  assert.equal(ALL.length, 38);
  for (const n of NEW) assert.ok(byName(n), n);
  for (const c of ALL) assert.deepEqual(validateContract(c), [], c.name);
});

test('every contract is in exactly one kit-sheet group', () => {
  const grouped = GROUPS.flatMap((g) => g.names);
  assert.equal(new Set(grouped).size, grouped.length, 'no contract in two groups');
  assert.deepEqual([...grouped].sort(), ALL.map((c) => c.name).sort());
  assert.deepEqual(GROUPS.map((g) => g.title), ['Основа', 'Формы', 'Навигация', 'Данные', 'Обратная связь', 'Оверлеи', 'CRM']);
});

test('new contracts: text layers are the sentence-case part names, kit pieces are instances', () => {
  for (const n of NEW) {
    const c = byName(n);
    for (const p of c.parts.filter((x) => partKind(x, c) === 'text')) assert.equal(c.anatomy?.[p]?.layer, sentence(p), `${n}.${p}`);
  }
  assert.equal(byName('empty-state').anatomy.action.component.name, 'Button');
  assert.equal(byName('dialog').anatomy.confirm.component.name, 'Button');
  assert.equal(byName('crm-list-item').anatomy.avatar.component.name, 'Avatar');
  assert.equal(byName('crm-list-item').code.kind, 'block');
});

test('contract-render-all builds all 38 with zero validation errors; instances resolve to the kit sets', async () => {
  const m = await kit();
  const res = await m.handlers['contract-render-all']({});
  assert.deepEqual(res.failed, []);
  assert.equal(res.built, 38);
  for (const c of res.contracts) assert.deepEqual(c.errors, [], c.name);
  assert.ok(res.contracts.every((c) => c.rendered), 'every contract is on its page');
  const page = figma.root.children.find((p) => p.name === 'Components');
  const sections = page.children.filter((n) => n.type === 'SECTION').map((s) => s.name);
  assert.deepEqual(sections, GROUPS.map((g) => g.title));
  const built = (title) => page.findOne((n) => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.name === title);

  const nav = built('Nav item');
  assert.equal(nav.type, 'COMPONENT_SET');
  assert.equal(nav.children.length, 4);
  const key = Object.keys(nav.componentPropertyDefinitions).find((k) => /^Label#/.test(k));
  assert.ok(key, 'nav-item has the «Label» text property');
  const label = nav.children[0].findOne((n) => n.name === 'Label');
  assert.equal(label.componentPropertyReferences.characters, key, 'the «Label» layer is driven by the property');
  assert.ok(nav.children[0].findOne((n) => n.name === 'Count'));

  const crumb = built('Breadcrumb item');
  const current = crumb.children.find((v) => v.name === 'current=true');
  assert.equal(current.findOne((n) => n.name === 'Separator').visible, false, 'the current item has no separator');

  const empty = built('Empty state');
  assert.equal(empty.type, 'COMPONENT', 'no props, one state: a plain component');
  const action = empty.findOne((n) => n.name === 'Action');
  assert.equal(action.type, 'INSTANCE');
  assert.equal(action.mainComponent.parent.name, 'Button', 'the action is an instance of our Button set');
  const dialog = built('Dialog');
  assert.equal(dialog.findOne((n) => n.name === 'Footer').children.filter((n) => n.type === 'INSTANCE').length, 2);
  const row = built('CRM / List item');
  assert.equal(row.findOne((n) => n.name === 'Avatar').mainComponent.parent.name, 'Avatar');

  const radio = built('Radio');
  assert.equal(radio.children.find((v) => v.name === 'state=checked').findOne((n) => n.name === 'Dot').visible, true);
  assert.equal(radio.children.find((v) => v.name === 'state=default').findOne((n) => n.name === 'Dot').visible, false);
  const sep = built('Separator');
  const h = sep.children.find((v) => v.name === 'orientation=horizontal');
  const vert = sep.children.find((v) => v.name === 'orientation=vertical');
  // an empty hug frame: its width is the padding (1 px vertical, 240 px horizontal), its height is fixed
  assert.ok(h.paddingLeft * 2 > h.height && vert.paddingLeft * 2 < vert.height, 'separator lines run along their orientation');
  assert.equal(vert.layoutMode, 'HORIZONTAL', 'not a column: a column set gets a 320 px fixed width');
});

test('the kit sheet does not repaint single components: no own background stays empty, own radius stays', async () => {
  const { figma, handlers } = await kit();
  await handlers['contract-render-all']({});
  const page = figma.root.children.find((p) => p.name === 'Components');
  const single = (name) => page.findOne((n) => n.type === 'COMPONENT' && n.getPluginData('mbank-contract') === name);
  for (const name of ['crm-key-value-row', 'crm-timeline-item', 'table-cell']) {
    const n = single(name);
    assert.ok(n, name);
    assert.deepEqual(n.fills, [], `${name} has no background in its contract`);
    assert.notEqual(n.cornerRadius, 16, `${name} keeps its own radius`);
  }
});
