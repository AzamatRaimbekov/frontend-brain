// «Компоненты» tab on the mocked Figma API: contract -> component set, bindings, update in place, handlers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createFigma, seedKit } from './figma-mock.mjs';
import { COLOR_TOKENS, EXTENSION_TOKENS } from '../core/tokens.js';
import { setBinding } from '../core/contract.js';

const KIT_TOKENS = COLOR_TOKENS.filter((t) => !EXTENSION_TOKENS.includes(t));
const dir = new URL('./fixtures/contracts/', import.meta.url);
const FIXTURES = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(new URL(f, dir))));
const fixture = (n) => FIXTURES.find((c) => c.name === n);

// shadcn kit + Brand layer + Tailwind spacing + a slice of the Mbank Foundation file (2.theme).
async function fresh() {
  const m = createFigma();
  globalThis.figma = m.figma;
  await seedKit(m.figma, KIT_TOKENS);
  const brand = await import('../plugin/src/brand.js');
  await brand.setupBrand({ fixNames: true });
  const v = m.figma.variables;
  const tw = [...m.cols.values()].find((c) => c.name === 'Tailwind');
  const spacing = {};
  for (const step of [1, 2, 3, 4, 6, 9, 11, 14]) {
    spacing[step] = v.createVariable(`spacing/${step}`, tw, 'FLOAT');
    spacing[step].setValueForMode(tw.defaultModeId, step * 4);
  }
  const theme = v.createVariableCollection('2.theme');
  const hover = v.createVariable('accent/primary/hover', theme, 'COLOR');
  hover.setValueForMode(theme.defaultModeId, { r: 1, g: 0.7, b: 0, a: 1 });
  const { renderContract } = await import('../plugin/src/components.js');
  const { contractHandlers } = await import('../plugin/src/contracts.js');
  return { ...m, brand, spacing, hover, renderContract, handlers: contractHandlers(FIXTURES) };
}

const variant = (set, name) => set.children.find((n) => n.name === name);
const fillVar = (m, node) => m.vars.get(node.fills[0].boundVariables.color.id);

test('button contract -> component set with every token bound', async () => {
  const m = await fresh();
  const { report, contract } = await m.renderContract(fixture('button'));
  const page = m.figma.root.children.find((p) => p.name === 'Components');
  const set = page.children.find((n) => n.type === 'COMPONENT_SET');
  assert.equal(set.id, report.setId);
  assert.equal(contract.figma.nodeId, set.id);
  assert.equal(set.getPluginData('mbank-contract'), 'button');
  assert.equal(set.children.length, 60);
  const defs = set.componentPropertyDefinitions;
  assert.deepEqual(Object.keys(defs).filter((k) => defs[k].type === 'VARIANT'), ['variant', 'size', 'state']);
  assert.ok(Object.keys(defs).some((k) => /^Label#/.test(k)), 'the label is a text property');
  assert.deepEqual(defs.state.variantOptions, ['default', 'hover', 'active', 'focus', 'disabled']);

  const md = variant(set, 'variant=primary, size=md, state=default');
  assert.equal(fillVar(m, md).name, 'primary', 'kit token: Mode/primary');
  assert.equal(md.layoutMode, 'HORIZONTAL');
  assert.equal(md.height, 44);
  assert.equal(md.boundVariables.height.id, m.spacing[11].id);
  assert.equal(md.boundVariables.paddingLeft.id, m.spacing[4].id);
  assert.equal(md.boundVariables.itemSpacing.id, m.spacing[2].id);
  assert.equal(m.vars.get(md.boundVariables.topLeftRadius.id).name, 'radius/md');
  const label = md.children.find((n) => n.name === 'label');
  assert.equal(label.characters, 'Кнопка');
  assert.ok(label.textStyleId, 'label has a text style');
  assert.equal(fillVar(m, label).name, 'primary-foreground');
  assert.deepEqual(md.children.map((n) => n.name), ['label', 'icon']);

  const hover = variant(set, 'variant=primary, size=md, state=hover');
  assert.equal(fillVar(m, hover).id, m.hover.id, 'primary-hover found through the baked Mbank map (2.theme accent/primary/hover)');
  const focus = variant(set, 'variant=primary, size=md, state=focus');
  assert.equal(m.vars.get(focus.effects[0].boundVariables.color.id).name, 'ring');
  assert.equal(focus.effects[0].color.a, 0.5);
  assert.equal(variant(set, 'variant=primary, size=md, state=disabled').opacity, 0.5);

  const outline = variant(set, 'variant=outline, size=sm, state=hover');
  assert.equal(m.vars.get(outline.strokes[0].boundVariables.color.id).name, 'outline-hover', 'missing token created in Mode');
  const created = report.createdTokens.map((t) => t.token);
  assert.ok(created.includes('outline') && created.includes('ghost-hover'));
  assert.deepEqual(report.createdTokens.find((t) => t.token === 'ghost-hover').like, 'ghost', 'hover placeholder follows its base token');
  const outlineVar = [...m.vars.values()].find((v) => v.name === 'outline');
  assert.equal(outlineVar.getPluginData('ds'), 'contract-placeholder');
  assert.equal(outlineVar.codeSyntax.WEB, 'var(--outline)');
  assert.equal(report.unbound, 0, JSON.stringify(report.missing));
  assert.deepEqual(report.missing, []);
});

test('re-render updates the set in place; instances stay linked; stale variants kept or pruned', async () => {
  const m = await fresh();
  const first = await m.renderContract(fixture('button'));
  const page = m.figma.root.children.find((p) => p.name === 'Components');
  const set = page.children.find((n) => n.type === 'COMPONENT_SET');
  const md = variant(set, 'variant=primary, size=md, state=default');
  const inst = md.createInstance();
  md.children.find((n) => n.name === 'label').characters = 'Оплатить';

  const edited = setBinding(fixture('button'), ['variants', 'variant', 'primary', 'root'], 'bg', 'secondary');
  const again = await m.renderContract(edited);
  assert.equal(again.report.setId, first.report.setId);
  assert.equal(again.report.created, 0);
  assert.equal(again.report.updated, 60);
  assert.equal(page.children.filter((n) => n.type === 'COMPONENT_SET').length, 1);
  assert.ok(set.children.includes(inst.mainComponent), 'instance main component still in the set');
  assert.equal(fillVar(m, md).name, 'secondary', 'rebound in place');
  assert.equal(md.children.find((n) => n.name === 'label').characters, 'Оплатить', 'designer text kept');

  const fewer = JSON.parse(JSON.stringify(edited));
  fewer.props.variant.values = ['primary', 'secondary', 'outline'];
  delete fewer.variants.variant.ghost;
  const kept = await m.renderContract(fewer);
  assert.equal(kept.report.stale.length, 15);
  assert.equal(set.children.length, 60);
  const pruned = await m.renderContract(fewer, { prune: true });
  assert.equal(pruned.report.stale.length, 15);
  assert.equal(set.children.length, 45);
});

test('badge (compound, no states) and input (border states) render', async () => {
  const m = await fresh();
  const b = await m.renderContract(fixture('badge'));
  const set = m.figma.root.findOne((n) => n.id === b.report.setId);
  assert.equal(set.children.length, 12);
  const solid = variant(set, 'tone=success, fill=solid, size=sm');
  assert.equal(fillVar(m, solid).name, 'status-success');
  assert.equal(solid.cornerRadius, 9999, 'radius full without a variable');
  const i = await m.renderContract(fixture('input'));
  const iset = m.figma.root.findOne((n) => n.id === i.report.setId);
  const focus = variant(iset, 'size=md, state=focus');
  assert.equal(m.vars.get(focus.strokes[0].boundVariables.color.id).name, 'ring');
  const dis = variant(iset, 'size=md, state=disabled');
  assert.equal(fillVar(m, dis.children[0]).name, 'disabled-foreground');
  assert.equal(fillVar(m, dis).name, 'muted');
});

test('without the Brand layer missing tokens are reported, not invented', async () => {
  const m = createFigma();
  globalThis.figma = m.figma;
  await seedKit(m.figma, KIT_TOKENS);
  const { renderContract } = await import('../plugin/src/components.js');
  const { report } = await renderContract(fixture('badge'));
  assert.ok(report.missing.some((x) => x.kind === 'color' && x.token === 'status-success'));
  assert.equal(report.createdTokens.length, 0);
  assert.ok(report.unbound > 0);
  const bad = await renderContract({ ...fixture('badge'), $schema: 'x' });
  assert.ok(bad.errors.length);
});

test('handlers: list, import, bind (rebinds in Figma), new component, export, reset', async () => {
  const m = await fresh();
  const h = m.handlers;
  const list = await h['contracts-list']();
  assert.deepEqual(list.contracts.map((c) => c.name).sort(), ['badge', 'button', 'input']);
  assert.equal(list.templates.length, 4);
  const imp = await h['contract-import']({ json: [{ ...fixture('badge'), name: 'chip' }, { name: 'bad' }] });
  assert.ok(imp.errors.bad);
  assert.equal(imp.contracts.find((c) => c.name === 'chip').source, 'file');

  await h['contract-render']({ name: 'button', states: ['default', 'hover'] });
  const rows = await h['contract-rows']({ name: 'button' });
  assert.ok(rows.vars.some((v) => v.token === 'primary' && v.collection === 'Mode'));
  assert.ok(rows.vars.some((v) => v.token === 'primary-hover' && v.collection === '2.theme'), 'Foundation names map back to tokens');
  const row = rows.rows.find((r) => r.source === 'variant=primary' && r.key === 'bg');
  const bound = await h['contract-bind']({ name: 'button', path: row.path, key: row.key, value: 'destructive' });
  assert.equal(bound.contract.variants.variant.primary.root.bg, 'destructive');
  assert.equal(bound.contract.states.length, 2, 'states edited in the tab persist');
  const set = m.figma.root.findOne((n) => n.id === bound.report.setId);
  assert.equal(set.children.length, 4 * 3 * 2);
  assert.equal(fillVar(m, variant(set, 'variant=primary, size=sm, state=default')).name, 'destructive');
  assert.equal((await h['contracts-list']()).contracts.find((c) => c.name === 'button').source, 'edited');

  const made = await h['contract-new']({ name: 'Promo Card', template: 'card-like', props: 'tone=default,accent' });
  assert.equal(made.contract.name, 'promo-card');
  const cset = m.figma.root.findOne((n) => n.id === made.report.setId);
  assert.equal(cset.children.length, 2);
  assert.equal(cset.children[0].layoutMode, 'VERTICAL');
  await assert.rejects(h['contract-new']({ name: 'promo card', template: 'card-like' }), /уже есть/);

  const one = await h['contract-export']({ name: 'button' });
  assert.equal(one.contracts.length, 1);
  assert.equal(one.contracts[0].figma.nodeId, set.id);
  const all = await h['contract-export']({});
  assert.deepEqual(all.contracts.map((c) => c.name).sort(), ['badge', 'button', 'chip', 'input', 'promo-card']);
  const reset = await h['contract-reset']({ name: 'button' });
  assert.equal(reset.contracts.find((c) => c.name === 'button').source, 'bundled');
});

test('dist is built with the Components tab and runs the bundled contracts end to end', async () => {
  const ui = readFileSync(new URL('../plugin/dist/ui.html', import.meta.url), 'utf8');
  const code = readFileSync(new URL('../plugin/dist/code.js', import.meta.url), 'utf8');
  assert.match(ui, /data-tab="components"/);
  assert.match(ui, /id="cRows"/);
  const m = await fresh();
  const out = [];
  m.figma.ui.postMessage = (msg) => out.push(msg);
  new Function('figma', '__html__', code)(m.figma, '<html></html>');
  const ask = async (msg) => { await m.figma.ui.onmessage(msg); return out.at(-1); };
  const list = await ask({ type: 'contracts-list' });
  assert.equal(list.type, 'contracts-list:done', JSON.stringify(list));
  assert.ok(list.contracts.length >= 3, 'contracts are bundled into dist');
  const name = list.contracts[0].name;
  const built = await ask({ type: 'contract-render', name });
  assert.equal(built.type, 'contract-render:done', JSON.stringify(built));
  assert.ok(built.report.variants > 0 && built.report.bound > 0);
});

test('render-all: a kit sheet — sections by group, a card per component; again updates in place', async () => {
  const m = await fresh();
  const h = m.handlers;
  const first = await h['contract-render-all']({});
  assert.equal(first.built, 3);
  assert.deepEqual(first.failed, []);
  const page = figma.root.children.find((p) => p.name === 'Components');
  const sections = page.children.filter((n) => n.type === 'SECTION');
  assert.deepEqual(sections.map((s) => s.name), ['Основа', 'Формы'], 'button+badge in Основа, input in Формы');
  const sets = page.findAll((n) => n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && n.parent.type !== 'COMPONENT_SET'));
  assert.equal(sets.length, 3);
  for (const s of sets) {
    assert.equal(s.parent.type, 'FRAME', 'each set sits in its doc card');
    assert.match(s.parent.name, /^Doc \//);
    assert.equal(s.parent.children[0].type, 'TEXT', 'title first');
  }
  const ids = sets.map((n) => n.id).sort();
  const cards = page.findAll((n) => n.type === 'FRAME' && /^Doc \//.test(n.name)).length;
  await h['contract-render-all']({});
  assert.deepEqual(page.findAll((n) => n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && n.parent.type !== 'COMPONENT_SET')).map((n) => n.id).sort(), ids, 'same nodes: instances stay linked');
  assert.equal(page.findAll((n) => n.type === 'FRAME' && /^Doc \//.test(n.name)).length, cards, 'cards reused, not duplicated');
  assert.equal(page.children.filter((n) => n.type === 'SECTION').length, 2);
});

test('a library import that never settles (no access) times out instead of freezing the build', async () => {
  const { importByKey, resetLibraryImports } = await import('../plugin/src/library-import.js');
  resetLibraryImports();
  const t0 = Date.now();
  assert.equal(await importByKey(() => new Promise(() => {})), null);
  assert.ok(Date.now() - t0 < 6000);
  const t1 = Date.now();
  assert.equal(await importByKey(() => Promise.resolve('x')), null, 'library marked unreachable for the rest of the run');
  assert.ok(Date.now() - t1 < 50);
  resetLibraryImports();
  assert.equal(await importByKey(() => Promise.resolve('x')), 'x');
});

test('button: a «Label» text property drives the label; icon sizes hide the label and show the icon', async () => {
  await fresh();
  const button = JSON.parse(readFileSync(new URL('../contracts/button.json', import.meta.url), 'utf8'));
  const { renderContract } = await import('../plugin/src/components.js');
  const res = await renderContract(button);
  assert.deepEqual(res.errors, undefined);
  const set = await figma.getNodeByIdAsync(res.report.setId);
  const key = Object.keys(set.componentPropertyDefinitions).find((k) => /^Label#/.test(k));
  assert.ok(key, 'Label property');
  const md = set.children.find((v) => v.name === 'variant=primary, size=md, state=default');
  const icon = set.children.find((v) => v.name === 'variant=primary, size=icon, state=default');
  const label = (v) => v.findOne((n) => n.name === 'label');
  assert.equal(label(md).visible, true);
  assert.equal(label(md).componentPropertyReferences.characters, key);
  assert.equal(label(md).characters, 'Кнопка');
  assert.equal(label(icon).visible, false);
  assert.equal(icon.findOne((n) => n.name === 'icon').visible, true);
  assert.equal(md.findOne((n) => n.name === 'icon').visible, false);
});

test('avatar: the fallback circle fills the avatar and holds the initials', async () => {
  await fresh();
  const avatar = JSON.parse(readFileSync(new URL('../contracts/avatar.json', import.meta.url), 'utf8'));
  const { renderContract } = await import('../plugin/src/components.js');
  const res = await renderContract(avatar);
  assert.equal(res.errors, undefined);
  const set = await figma.getNodeByIdAsync(res.report.setId);
  const sm = set.children.find((v) => v.name === 'size=sm');
  const fb = sm.findOne((n) => n.name === 'fallback');
  assert.equal(fb.layoutSizingHorizontal, 'FILL');
  assert.equal(fb.layoutSizingVertical, 'FILL');
  assert.equal(fb.findOne((n) => n.name === 'text').characters, 'АТ');
});
