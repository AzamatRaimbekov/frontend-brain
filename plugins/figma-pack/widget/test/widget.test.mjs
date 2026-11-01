// The built widget (dist/code.js) on the mocked Figma API with Widget API stubs: renders the board,
// switches brand, edits through the iframe messages, applies to variables, rescans, exports.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { boot, openWindow, byName, hex, UI, MANIFEST } from './helpers.mjs';

test('manifest is a Figma widget for Figma and FigJam', () => {
  assert.equal(MANIFEST.containsWidget, true);
  assert.deepEqual(MANIFEST.editorType, ['figma', 'figjam']);
  assert.equal(MANIFEST.main, 'dist/code.js');
  assert.ok(!/#[0-9a-f]{6}\b/i.test(readFileSync(new URL('../src/ui/ui.html', import.meta.url), 'utf8')), 'no hex in the UI source');
  assert.match(UI, /--brand:#[0-9a-f]{6}/, 'Mbank colours injected at build');
});

test('renders the board: brand switcher, counters, rows with Figma names and statuses', () => {
  const { w } = boot();
  assert.ok(w.registered);
  const tree = w.render();
  const texts = w.texts(tree);
  assert.ok(texts.includes('Mbank Tokens'));
  for (const b of ['bank', 'kassa', 'travel', 'artwin', 'koko']) assert.ok(texts.includes(b), b);
  assert.ok(texts.includes('проблем контраста AA'));
  assert.ok(texts.includes('--brand') && texts.includes('1.brand / brand/default'));
  assert.ok(texts.includes('не проверено'));
  assert.ok(w.menu.items.some((i) => i.propertyName === 'apply'));
  const swatch = w.find(tree, (n) => n.type === 'Rectangle' && n.props.fill && Math.abs(n.props.fill.g - 0xa3 / 255) < 0.002 && Math.abs(n.props.fill.r - 0x16 / 255) < 0.002);
  assert.ok(swatch.length, 'bank brand swatch #16a34a');

  // Brand switch on the canvas and group tabs.
  const kassa = w.find(tree, (n) => n.type === 'AutoLayout' && n.props.onClick && n.children[0]?.children?.[0] === 'kassa')[0];
  kassa.props.onClick();
  assert.equal(w.state.get('brand'), 'kassa');
  const tab = w.find(w.render(), (n) => n.type === 'AutoLayout' && n.props.onClick && String(n.children[0]?.children?.[0]).startsWith('Акценты'))[0];
  tab.props.onClick();
  assert.ok(w.texts(w.render()).includes('--primary'));
  w.menu.handler({ propertyName: 'brand', propertyValue: 'koko' });
  assert.equal(w.state.get('brand'), 'koko');
});

test('edit in the window, apply to an empty file, rescan, export', async () => {
  const { w, ...m } = boot((f) => {
    // A primitive the brand colour can alias to.
    const prim = f.variables.createVariableCollection('Primitives');
    const v = f.variables.createVariable('violet/60', prim, 'COLOR');
    v.setValueForMode(prim.defaultModeId, { r: 0x7c / 255, g: 0x3a / 255, b: 0xed / 255, a: 1 });
  });
  const ui = await openWindow(w);
  let r = await ui.send('ready');
  assert.equal(w.sent.find((x) => x.type === 'open')?.tab, 'tokens');
  assert.equal(r.state.rows.length > 100, true);
  await ui.send('brand', { brand: 'kassa' });
  r = await ui.send('set-token', { key: 'primary', light: '#7C3AED', dark: '#8b5cf6' });
  assert.deepEqual(r.done.errors, []);
  assert.deepEqual(w.maps.get('edits').get('primary'), { light: '#7c3aed', dark: '#8b5cf6' });
  r = await ui.send('set-token', { key: 'primary', light: 'red' });
  assert.match(r.done.errors.join(), /hex/);
  r = await ui.send('add-extra', { token: { name: 'mb-promo', kind: 'color', light: '#fef3c7', dark: '#451a03' } });
  assert.deepEqual(r.done.errors, []);
  r = await ui.send('add-extra', { token: { name: 'promo', kind: 'color', light: '#fef3c7' } });
  assert.match(r.done.errors.join(), /префикс/);
  r = await ui.send('gen-preview', { hex: '#0ea5e9' });
  assert.equal(r.done.preview.slots.length, 12);
  r = await ui.send('gen-apply', { hex: '#7c3aed' });
  assert.equal(r.done.count, 12);
  assert.equal(w.maps.get('edits').get('kassa:brand').light, '#7c3aed');
  r = await ui.send('contract', { name: 'button' });
  const bg = r.done.contract.rows.find((x) => x.prop === 'bg');
  r = await ui.send('binding', { contract: 'button', rowId: bg.id, path: bg.path, key: bg.key, value: 'brand' });
  assert.equal(r.done.contract.edited, 1);
  assert.equal(r.state.rows.find((x) => x.key === 'kassa:brand').edited, true);

  // Dry run writes nothing, then the real apply of every token into an empty file.
  r = await ui.send('apply', { dryRun: true, all: true });
  assert.deepEqual(r.done.report.collectionsCreated, ['2.theme', '1.brand']);
  assert.equal([...m.cols.values()].filter((c) => c.name === '2.theme').length, 0, 'dry run did not write');
  r = await ui.send('apply', { all: true });
  const rep = r.done.report;
  assert.deepEqual(rep.errors, []);
  assert.ok(rep.created.length > 150, `created ${rep.created.length}`);
  assert.ok(rep.raw.length > 0 && rep.raw.every((x) => /#[0-9a-f]{6}/.test(x)), 'every raw hex is reported');
  assert.ok(rep.aliased.some((x) => x.includes('violet/60')), 'equal colour became an alias to the primitive');
  const primary = byName(m, '2.theme', 'accent/primary/default');
  assert.deepEqual(primary.col.modes.map((x) => x.name), ['light', 'dark']);
  assert.equal(hex(primary.v.valuesByMode[primary.mode('dark')]), '#8b5cf6');
  assert.equal(primary.v.valuesByMode[primary.mode('light')].type, 'VARIABLE_ALIAS');
  assert.deepEqual(primary.v.scopes, ['FRAME_FILL', 'SHAPE_FILL']);
  assert.equal(primary.v.codeSyntax.WEB, 'var(--primary)');
  const brand = byName(m, '1.brand', 'brand/default');
  assert.deepEqual(brand.col.modes.map((x) => x.name), ['bank', 'kassa', 'travel', 'artwin', 'koko']);
  assert.equal(hex(brand.v.valuesByMode[brand.mode('bank')]), '#16a34a');
  assert.equal(brand.v.valuesByMode[brand.mode('kassa')].type, 'VARIABLE_ALIAS', 'generated #7c3aed = primitive violet/60');
  const promo = byName(m, '2.theme', 'custom/mb/promo');
  assert.equal(hex(promo.v.valuesByMode[promo.mode('dark')]), '#451a03');
  assert.ok(byName(m, '1.brand', 'radius/m').v.resolvedType === 'FLOAT');

  // Apply rescans: everything on the board is now in the file.
  assert.equal(r.state.totals.missing, 0);
  assert.equal(r.state.totals.differs, 0);
  const again = (await ui.send('apply', { all: true })).done.report;
  assert.equal(again.created.length + again.updated.length + again.raw.length, 0, 'second apply changes nothing');
  assert.match(w.texts(w.render()).join('\n'), /Применено: создано/);

  // A designer changes a variable by hand: the board shows it differs.
  primary.v.setValueForMode(primary.mode('dark'), { r: 0, g: 0, b: 0, a: 1 });
  r = await ui.send('scan');
  assert.equal(r.state.rows.find((x) => x.css === 'primary').status, 'differs');

  r = await ui.send('export');
  const names = r.done.files.map((f) => f.name);
  assert.deepEqual(names, ['tokens.json', 'mbank-tokens-raw.json', 'registry-mbank-kassa.json', 'tokens-kassa.css', 'button.json']);
  const tokens = JSON.parse(r.done.files[0].text);
  assert.equal(tokens.theme.vars.find((v) => v.name === 'accent/primary/default').light, '#7c3aed');
  assert.equal(JSON.parse(r.done.files[2].text).type, 'registry:base');
  assert.ok(r.done.commands.some((c) => c.cmd.includes('sync-contracts.mjs')));

  r = await ui.send('import', { text: r.done.files[0].text });
  assert.deepEqual(r.done.result.errors, []);
  await figma.ui.onmessage({ type: 'close' });
  await ui.pending;
  assert.equal(figma.closed, true);
});

test('scan of an empty file shows missing variables and FigJam refuses to apply', async () => {
  const { w } = boot();
  w.render();
  await w.menu.handler({ propertyName: 'scan' });
  assert.match(figma.notifications.at(-1), /Проверено: 0/);
  assert.equal(w.state.get('scan').count, 0);
  assert.ok(w.texts(w.render()).includes('нет в файле'));
  figma.editorType = 'figjam';
  const ui = await openWindow(w, 'apply');
  assert.equal(w.sent.length, 0);
  await assert.rejects(ui.send('apply', {}), /FigJam/);
});

test('a file that connects Foundation as a library refuses apply (dry run still works)', async () => {
  const { w } = boot((f) => {
    f.teamLibrary = {
      getAvailableLibraryVariableCollectionsAsync: async () => [
        { key: 'k1', name: '2.theme', libraryName: 'Foundation' },
        { key: 'k2', name: '1.brand', libraryName: 'Foundation' },
      ],
      getVariablesInLibraryCollectionAsync: async () => [],
    };
  });
  const ui = await openWindow(w, 'apply');
  const r = await ui.send('apply', { dryRun: true, all: true });
  assert.equal(r.done.report.dryRun, true);
  await assert.rejects(ui.send('apply', { all: true }), /библиотеки «Foundation»/);
});

test('bindings are shared with DS Builder through document sharedPluginData "mbank"', async () => {
  const { w } = boot();
  const ui = await openWindow(w);
  let r = await ui.send('contract', { name: 'button' });
  const bg = r.done.contract.rows.find((x) => x.prop === 'bg');
  await ui.send('binding', { contract: 'button', rowId: bg.id, path: bg.path, key: bg.key, value: 'brand' });
  const stored = JSON.parse(figma.root.getSharedPluginData('mbank', 'contract:button'));
  assert.equal(stored.name, 'button');
  assert.ok(JSON.stringify(stored).includes('"brand"'), 'the edited binding is in the shared contract');
  // An edit made by DS Builder (written to the same place) shows up in the widget.
  stored.title = 'Button (DS Builder)';
  figma.root.setSharedPluginData('mbank', 'contract:button', JSON.stringify(stored));
  r = await ui.send('contract', { name: 'button' });
  assert.equal(r.done.contract.title, 'Button (DS Builder)');
  await ui.send('binding-reset', { contract: 'button' });
  assert.equal(figma.root.getSharedPluginData('mbank', 'contract:button'), '');
});
