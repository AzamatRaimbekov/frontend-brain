// Rules tuned on the first real crawl (2026-11-01: CRM UI KIT + "[draft] Mbank CRM — тест ИИ").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify } from '../archetypes.mjs';
import { libraryIndex, nearestToken, FAR } from '../library.mjs';

const maps = { components: {}, componentSets: {}, names: new Set() };
const frame = (name, children) => ({ id: '1:1', type: 'FRAME', name, children });
const node = (name, i) => ({ id: `2:${i}`, type: 'FRAME', name, children: [] });
const many = (name, n) => Array.from({ length: n }, (_, i) => node(name, i));

test('a pipeline of application cards is a board even with KPI cards above it', () => {
  const f = frame('CRM / Конвейер заявок / Default / 1440', [...many('CRM / KPI card', 4), ...many('CRM / Application card', 12)]);
  assert.equal(classify(f, maps).archetype, 'board');
});

test('repeated list rows without a table make a list (mobile transfers, payments)', () => {
  const f = frame('Mobile / Переводы / Default / 393', [node('Top-app-bar', 0), ...many('Cell/list item', 6)]);
  assert.equal(classify(f, maps).archetype, 'list');
});

test('library files are known from the catalog, so their docs are not product screens', () => {
  const lib = libraryIndex({ catalog: { libraries: [{ name: 'CRM UI KIT', fileKey: 'MisYjVLDaBvvQ95uzxpFB0' }], components: [] } });
  assert.equal(lib.isLibraryFile('MisYjVLDaBvvQ95uzxpFB0'), true);
  assert.equal(lib.isLibraryFile('vVuM5uw3TsWo1xm3vJelXG'), false);
});

test('a colour far from every token is off-palette, not a near miss', () => {
  const tokens = { theme: { vars: [{ name: 'text/default', light: '#0e0f11' }, { name: 'brand/bank/on-accent', light: '#ffffff' }] } };
  assert.equal(nearestToken('#ffffff', tokens).exact, true);
  assert.equal(nearestToken('#000000', tokens).name, 'text/default', 'the hint still names the nearest token');
  assert.equal(nearestToken('#000000', tokens).far, true, 'pure black is ≈27 from #0e0f11: off-palette');
  const far = nearestToken('#445371', tokens);
  assert.ok(far.distance > FAR && far.far);
});
