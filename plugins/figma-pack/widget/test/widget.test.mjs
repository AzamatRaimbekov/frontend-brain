// The built widget (dist/code.js) on the mocked Figma API with Widget API stubs: renders the board,
// edits through the iframe messages, applies to the `shadcn` collection, rescans, exports.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { boot, openWindow, byName, hex, UI, MANIFEST } from './helpers.mjs';

test('manifest: widget "shadcn Tokens" for Figma and FigJam, same id as before (updates in place)', () => {
  assert.equal(MANIFEST.name, 'shadcn Tokens');
  assert.equal(MANIFEST.id, 'mbank-tokens-mdigital');
  assert.equal(MANIFEST.containsWidget, true);
  assert.deepEqual(MANIFEST.editorType, ['figma', 'figjam']);
  assert.equal(MANIFEST.main, 'dist/code.js');
  assert.ok(!/#[0-9a-f]{6}\b/i.test(readFileSync(new URL('../src/ui/ui.html', import.meta.url), 'utf8')), 'no hex in the UI source');
  assert.match(UI, /--primary:#171717/, 'shadcn primary injected at build');
  assert.match(UI, /<h1>shadcn Tokens<\/h1>/);
});

test('renders the board: title, counters, rows named as the shadcn CSS variables, no brand switcher', () => {
  const { w } = boot();
  assert.ok(w.registered);
  const tree = w.render();
  const texts = w.texts(tree);
  assert.ok(texts.includes('shadcn Tokens'));
  assert.ok(texts.includes('проблем контраста AA'));
  assert.ok(texts.includes('--background') && texts.includes('shadcn / background'));
  assert.ok(texts.includes('не проверено'));
  for (const gone of ['bank', 'Mbank Tokens']) assert.ok(!texts.includes(gone), gone);
  assert.deepEqual(w.menu.items.map((i) => i.propertyName), ['edit', 'scan', 'apply', 'sync', 'site']);
  const white = w.find(tree, (n) => n.type === 'Rectangle' && n.props.fill && Math.abs(n.props.fill.r - 1) < 1e-6 && Math.abs(n.props.fill.b - 1) < 1e-6 && n.props.fill.a === 1);
  assert.ok(white.length, 'background swatch is white from oklch(1 0 0)');
  // Group tab.
  const tab = w.find(tree, (n) => n.type === 'AutoLayout' && n.props.onClick && String(n.children[0]?.children?.[0]).startsWith('Сайдбар'))[0];
  tab.props.onClick();
  assert.ok(w.texts(w.render()).includes('--sidebar-primary-foreground'));
});

test('edit in the window, apply to an empty file (collection shadcn, Light/Dark), rescan, export', async () => {
  const { w, ...m } = boot();
  const ui = await openWindow(w);
  let r = await ui.send('ready');
  assert.equal(w.sent.find((x) => x.type === 'open')?.tab, 'tokens');
  assert.equal(r.state.rows.length, 32);
  r = await ui.send('set-token', { key: 'primary', light: 'oklch(0.541 0.247 293.009)', dark: '#8B5CF6' });
  assert.deepEqual(r.done.errors, []);
  assert.deepEqual(w.maps.get('edits').get('primary'), { light: 'oklch(0.541 0.247 293.009)', dark: '#8b5cf6' });
  r = await ui.send('set-token', { key: 'primary', light: 'red' });
  assert.match(r.done.errors.join(), /oklch/);
  r = await ui.send('set-token', { key: 'brand', light: '#000000' });
  assert.match(r.done.errors.join(), /не добавляются/);
  assert.equal(w.maps.get('edits').has('brand'), false);
  r = await ui.send('set-token', { key: 'radius', light: '12px' });
  assert.deepEqual(w.maps.get('edits').get('radius'), { light: '12px' });
  r = await ui.send('set-token', { key: 'ring', light: '#a1a1a1', dark: 'oklch(0.556 0 0)' });
  assert.equal(w.maps.get('edits').has('ring'), false, 'same as the source: no edit');

  // Preview, then the real apply of every token into a file without variables.
  r = await ui.send('apply', { all: true, dryRun: true });
  assert.equal(r.done.report.dryRun, true);
  assert.equal(r.done.report.collectionCreated, true);
  assert.equal(r.done.report.created.length, 32);
  assert.equal(m.vars.size, 0, 'dry run writes nothing');
  r = await ui.send('apply', { all: true });
  const rep = r.done.report;
  assert.deepEqual(rep.errors, []);
  assert.equal(rep.created.length, 32);
  const { col, v, mode } = byName(m, 'shadcn', 'primary');
  assert.deepEqual(col.modes.map((x) => x.name), ['Light', 'Dark']);
  assert.equal(hex(v.valuesByMode[mode('Light')]), '#7c3aed');
  assert.equal(hex(v.valuesByMode[mode('Dark')]), '#8b5cf6');
  assert.equal(v.codeSyntax.WEB, 'var(--primary)');
  assert.deepEqual(v.scopes, ['FRAME_FILL', 'SHAPE_FILL']);
  const border = byName(m, 'shadcn', 'border');
  assert.equal(hex(border.v.valuesByMode[border.mode('Dark')]), '#ffffff1a', 'alpha 10% kept');
  assert.deepEqual(border.v.scopes, ['STROKE_COLOR']);
  assert.deepEqual(byName(m, 'shadcn', 'card-foreground').v.scopes, ['TEXT_FILL']);
  const radius = byName(m, 'shadcn', 'radius');
  assert.equal(radius.v.resolvedType, 'FLOAT');
  assert.equal(radius.v.valuesByMode[radius.mode('Dark')], 12);
  assert.deepEqual(radius.v.scopes, ['CORNER_RADIUS']);
  assert.equal(hex(byName(m, 'shadcn', 'destructive').v.valuesByMode[mode('Light')]), '#e7000b');
  assert.equal([...m.cols.values()].length, 1, 'only the shadcn collection');

  // Rescan: everything bound; a second apply changes nothing.
  assert.equal(r.state.totals.bound, 32);
  r = await ui.send('apply', { all: true });
  assert.deepEqual([r.done.report.created.length, r.done.report.updated.length, r.done.report.unchanged], [0, 0, 64]);

  // A value changed by hand in Figma shows as "≠ файл" and comes back with apply.
  v.setValueForMode(mode('Light'), { r: 1, g: 0, b: 0, a: 1 });
  r = await ui.send('scan');
  assert.equal(r.state.rows.find((x) => x.name === 'primary').status, 'differs');
  r = await ui.send('apply', {});
  assert.deepEqual(r.done.report.updated, ['primary (Light): #ff0000 → #7c3aed']);

  // Exports.
  r = await ui.send('export');
  assert.deepEqual(r.done.files.map((f) => f.name), ['shadcn-tokens.json', 'tokens.css', 'shadcn-theme.json']);
  const json = JSON.parse(r.done.files[0].text);
  assert.equal(json.colors.primary.dark, '#8b5cf6');
  assert.equal(json.radius, '12px');
  assert.match(r.done.files[1].text, /--primary: oklch\(0\.541 0\.247 293\.009\);/);

  // Import replaces the edits.
  r = await ui.send('import', { text: JSON.stringify({ $schema: 'shadcn/tokens@1', colors: { accent: { light: '#fafafa', dark: '#262626' } } }) });
  assert.equal(r.done.result.changed, 1);
  assert.deepEqual([...w.maps.get('edits').keys()], ['accent']);

  r = await ui.send('reset-all');
  assert.equal(w.maps.get('edits').size, 0);
});

test('a file that connects shadcn from a library: apply refuses, dry run works', async () => {
  const { w, figma } = boot();
  figma.teamLibrary = { getAvailableLibraryVariableCollectionsAsync: async () => [{ key: 'L1', name: 'shadcn', libraryName: 'DS Library' }], getVariablesInLibraryCollectionAsync: async () => [{ name: 'primary' }] };
  const ui = await openWindow(w);
  await ui.send('ready');
  let r = await ui.send('scan');
  assert.equal(r.state.totals.library, 1);
  r = await ui.send('apply', { all: true, dryRun: true });
  assert.equal(r.done.report.created.length, 32);
  await assert.rejects(ui.send('apply', { all: true }), /библиотеки «DS Library»/);
});

test('FigJam: board and editing work, writing variables is refused', async () => {
  const { w, figma } = boot();
  figma.editorType = 'figjam';
  const ui = await openWindow(w);
  await ui.send('ready');
  await assert.rejects(ui.send('apply', { all: true }), /FigJam/);
});
