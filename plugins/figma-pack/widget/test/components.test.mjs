// Designer flow of the widget on the mocked Figma API: add a project token -> apply creates the
// variable; bind it to a component property -> «Обновить компонент в файле» re-renders the set in
// place (same nodes, instances follow) -> report of where it changed; insert an instance on the canvas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, openWindow, byName, hex, placeWidget, placeInstances, setOf, fillVar } from './helpers.mjs';

const PROMO = { name: 'mb-promo-surface', kind: 'color', light: '#fef3c7', dark: '#451a03' };
const CARD_RADIUS = { name: 'mb-card-radius', kind: 'radius', light: '20px', dark: '' };
const VARIANT = 'variant=primary, size=md, state=default';
const variant = (set, name) => set.children.find((n) => n.name === name);
const bindRow = (contract, pred) => contract.rows.find(pred);

// A Foundation-like file: every Mbank token applied, plus the two project tokens.
async function foundation() {
  const m = boot();
  placeWidget(m);
  const ui = await openWindow(m.w);
  await ui.send('add-extra', { token: PROMO });
  await ui.send('add-extra', { token: CARD_RADIUS });
  const r = await ui.send('apply', { all: true });
  assert.deepEqual(r.done.report.errors, []);
  return { ...m, ui };
}

test('a project token added in the window becomes a 2.theme variable with scopes and both modes', async () => {
  const { w, ...m } = boot();
  const ui = await openWindow(w, 'edit');
  let r = await ui.send('add-extra', { token: PROMO });
  assert.deepEqual(r.done.errors, []);
  r = await ui.send('add-extra', { token: CARD_RADIUS });
  assert.deepEqual(r.done.errors, []);
  r = await ui.send('set-extra', { token: { name: PROMO.name, light: '#FEF9C3', dark: '#451a03' } });
  assert.deepEqual(r.done.errors, []);
  assert.equal(w.maps.get('extras').get(PROMO.name).light, '#fef9c3', 'edited and normalised');
  r = await ui.send('set-extra', { token: { name: PROMO.name, light: 'red' } });
  assert.match(r.done.errors.join(), /не цвет/);
  assert.equal(r.state.rows.find((x) => x.css === PROMO.name).figma, 'custom/mb/promo-surface');

  r = await ui.send('apply', { dryRun: true });
  assert.ok(r.done.report.created.includes('2.theme/custom/mb/promo-surface'));
  assert.equal(m.cols.size, 0, 'dry run wrote nothing');

  r = await ui.send('apply', {});
  const rep = r.done.report;
  assert.deepEqual(rep.errors, []);
  assert.deepEqual(rep.created, ['2.theme/custom/mb/promo-surface', '2.theme/custom/mb/card-radius'], 'only the project tokens are written');
  const promo = byName(m, '2.theme', 'custom/mb/promo-surface');
  assert.deepEqual(promo.col.modes.map((x) => x.name), ['light', 'dark']);
  assert.equal(hex(promo.v.valuesByMode[promo.mode('light')]), '#fef9c3');
  assert.equal(hex(promo.v.valuesByMode[promo.mode('dark')]), '#451a03');
  assert.deepEqual(promo.v.scopes, ['FRAME_FILL', 'SHAPE_FILL']);
  assert.equal(promo.v.codeSyntax.WEB, 'var(--mb-promo-surface)');
  const radius = byName(m, '2.theme', 'custom/mb/card-radius');
  assert.equal(radius.v.resolvedType, 'FLOAT');
  assert.deepEqual(radius.v.scopes, ['CORNER_RADIUS']);
  assert.deepEqual(Object.values(radius.v.valuesByMode), [20, 20]);

  // Rescan after apply: both project tokens are in the file (radius too, it lives in 2.theme).
  assert.equal(r.state.rows.find((x) => x.css === PROMO.name).status, 'bound');
  assert.equal(r.state.rows.find((x) => x.css === CARD_RADIUS.name).status, 'bound');
  assert.deepEqual(rep.propagation.variables, ['2.theme/custom/mb/promo-surface', '2.theme/custom/mb/card-radius']);
  assert.equal(rep.propagation.components.length, 0, 'no contract uses the new tokens yet');

  // A second apply after a value change updates the variable in place.
  await ui.send('set-extra', { token: { name: PROMO.name, light: '#fde68a', dark: '#451a03' } });
  const again = (await ui.send('apply', {})).done.report;
  assert.equal(again.created.length, 0);
  assert.equal(again.updated.length + again.raw.length > 0, true);
  assert.equal(hex(byName(m, '2.theme', 'custom/mb/promo-surface').v.valuesByMode[promo.mode('light')]), '#fde68a');
});

test('bind a project token -> «Обновить компонент в файле» keeps the nodes, rebinds, counts instances', async () => {
  const m = await foundation();
  const { ui, w } = m;
  let r = await ui.send('contract', { name: 'button' });
  assert.equal(r.done.component.state, 'none');
  r = await ui.send('component-update', { name: 'button' });
  assert.equal(r.done.result.needsBuild, true, 'not in the file: offer «Собрать компонент»');
  r = await ui.send('component-update', { name: 'button', build: true });
  assert.equal(r.done.result.built, true);
  assert.equal(r.done.component.state, 'local');
  const set = setOf(m, 'Button');
  assert.equal(set.parent.name, 'Components');
  const ids = set.children.map((n) => n.id);
  const before = variant(set, VARIANT);
  assert.equal(fillVar(m, before).name, 'accent/primary/default', 'Mbank token bound from 2.theme');

  // A product screen uses the button: 5 + 2 instances on two pages.
  placeInstances(m, before, 5, 'Screens');
  placeInstances(m, variant(set, 'variant=secondary, size=sm, state=default'), 2, 'Checkout');

  // The designer binds the new project tokens in the «Компоненты» tab.
  r = await ui.send('contract', { name: 'button' });
  assert.equal(r.done.component.instances, 7);
  const contract = r.done.contract;
  const bg = bindRow(contract, (x) => x.prop === 'bg' && x.source === 'variant=primary' && x.state === 'default');
  r = await ui.send('binding', { contract: 'button', rowId: bg.id, path: bg.path, key: bg.key, kind: bg.kind, value: PROMO.name });
  assert.deepEqual(r.done.errors, []);
  const rad = bindRow(contract, (x) => x.prop === 'radius' && x.source === 'base');
  await ui.send('binding', { contract: 'button', rowId: rad.id, path: rad.path, key: rad.key, kind: rad.kind, value: CARD_RADIUS.name });
  const px = bindRow(contract, (x) => x.prop === 'px');
  r = await ui.send('binding', { contract: 'button', rowId: px.id, path: px.path, key: px.key, kind: 'space', value: '5' });
  assert.equal(bindRow(r.done.contract, (x) => x.id === px.id).value, 5, 'spacing stays a grid step number');
  r = await ui.send('binding', { contract: 'button', rowId: px.id, path: px.path, key: px.key, kind: 'space', value: 'wide' });
  assert.match(r.done.errors.join(), /шаг сетки/);
  const shared = JSON.parse(figma.root.getSharedPluginData('mbank', 'contract:button'));
  assert.equal(shared.variants.variant.primary.root.bg, PROMO.name, 'binding shared with DS Builder');

  r = await ui.send('component-update', { name: 'button' });
  const res = r.done.result;
  assert.equal(res.built, false);
  assert.deepEqual(set.children.map((n) => n.id), ids, 'same variant nodes: nothing deleted or recreated');
  assert.equal(res.kept, ids.length);
  assert.equal(res.variants, ids.length);
  assert.ok(res.extraBound > 0);
  assert.deepEqual(res.notApplied, []);
  const after = variant(set, VARIANT);
  assert.equal(after, before);
  assert.equal(fillVar(m, after).name, 'custom/mb/promo-surface', 'fill rebound to the project token');
  assert.equal(fillVar(m, variant(set, 'variant=primary, size=md, state=hover')).name, 'accent/primary/hover', 'state keys untouched');
  assert.equal(m.vars.get(after.boundVariables.topLeftRadius.id).name, 'custom/mb/card-radius');
  assert.deepEqual(after.children.map((n) => n.name), ['icon', 'label'], 'parts kept');
  for (const i of m.figma.root.findAllWithCriteria({ types: ['INSTANCE'] })) assert.ok(ids.includes(i.mainComponent.id), 'instances still linked');
  assert.equal(res.instances, 7);
  assert.deepEqual(res.pages, { Screens: 5, Checkout: 2 });

  // The report on the canvas board and in the window.
  const p = w.state.get('propagation');
  assert.equal(p.kind, 'component');
  assert.equal(p.setsUpdated, 1);
  assert.equal(p.instances, 7);
  const texts = w.texts(w.render()).join('\n');
  assert.match(texts, /Где поменялось — Обновить компонент в файле/);
  assert.match(texts, /компонентов 1 · обновлено наборов 1 · экземпляров в файле 7/);
  assert.ok(texts.includes(`Button: 7 экз. · вариантов ${ids.length}, те же узлы ${ids.length}`));
  assert.equal(r.state.propagation.instances, 7);

  // Changing the token now reaches the button and its 7 instances through the variable.
  await ui.send('set-extra', { token: { name: PROMO.name, light: '#fde68a', dark: '#451a03' } });
  r = await ui.send('apply', {});
  const prop = r.done.report.propagation;
  assert.deepEqual(prop.variables, ['2.theme/custom/mb/promo-surface']);
  assert.deepEqual(prop.components.map((x) => [x.name, x.inFile, x.instances]), [['button', true, 7]]);
  assert.equal(prop.instances, 7);
  assert.match(w.texts(w.render()).join('\n'), /Где поменялось — Применить в Figma[\s\S]*переменных 1 · компонентов 1 · экземпляров в файле 7/);
});

test('a project token bound before Apply is reported, not silently left magenta', async () => {
  const m = await foundation();
  const { ui } = m;
  await ui.send('component-update', { name: 'badge', build: true });
  await ui.send('add-extra', { token: { name: 'mb-badge-new', kind: 'color', light: '#ff00aa' } });
  const { done } = await ui.send('contract', { name: 'badge' });
  const bg = bindRow(done.contract, (x) => x.prop === 'bg' && x.source === 'tone=neutral');
  await ui.send('binding', { contract: 'badge', rowId: bg.id, path: bg.path, key: bg.key, kind: bg.kind, value: 'mb-badge-new' });
  let r = await ui.send('component-update', { name: 'badge' });
  assert.deepEqual(r.done.result.notApplied, ['mb-badge-new']);
  await ui.send('apply', {});
  r = await ui.send('component-update', { name: 'badge' });
  assert.deepEqual(r.done.result.notApplied, []);
  const set = setOf(m, 'Badge');
  assert.ok(set.children.every((v) => fillVar(m, v)), 'every variant fill is bound');
  assert.ok(set.children.some((v) => fillVar(m, v).name === 'custom/mb/badge-new'));
});

test('«Вставить на холст» drops instances next to the widget; library components insert but do not update', async () => {
  const key = 'f25dcf8a0cdeb0a978f91b7a07790d42b80f9dcd';
  const m = boot(null, { library: { components: [{ key, name: 'Badge-status' }] } });
  const widget = placeWidget(m);
  const ui = await openWindow(m.w);
  await assert.rejects(ui.send('component-insert', { name: 'button' }), /Собрать компонент/);
  await ui.send('apply', { all: true });
  await ui.send('component-update', { name: 'button', build: true });
  const set = setOf(m, 'Button');
  let r = await ui.send('component-insert', { name: 'button' });
  const first = await figma.getNodeByIdAsync(r.done.inserted.id);
  assert.equal(first.type, 'INSTANCE');
  assert.equal(first.mainComponent, set.defaultVariant);
  assert.equal(first.parent, widget.parent);
  assert.deepEqual([first.x, first.y], [widget.x + widget.width + 48, widget.y]);
  assert.deepEqual(figma.currentPage.selection, [first]);
  r = await ui.send('component-insert', { name: 'button' });
  const second = await figma.getNodeByIdAsync(r.done.inserted.id);
  assert.deepEqual([second.x, second.y], [first.x, first.y + first.height + 24], 'stacked under the previous one');
  assert.equal((await ui.send('contract', { name: 'button' })).done.component.instances, 2);

  // Badge is not built here, the connected library publishes it: insert works, update is refused.
  r = await ui.send('component-insert', { name: 'badge' });
  assert.equal(r.done.inserted.source, 'library');
  r = await ui.send('contract', { name: 'badge' });
  assert.equal(r.done.component.state, 'library');
  assert.equal(r.done.component.instances, 1);
  await assert.rejects(ui.send('component-update', { name: 'badge', build: true }), /из библиотеки/);
  assert.equal(setOf(m, 'Badge'), null, 'no local copy of a library component');
});
