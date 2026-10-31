// Bridge test: figma-pack read-tokens.js (runs inside Figma) feeds frontend-pack tokens-normalize.mjs.
// Run: node --test plugins/design-engine/scripts/read-tokens.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolvePlugin } from './resolve-plugin.mjs';

const READER = join(resolvePlugin('figma-pack'), 'skills', 'mbank-figma-patterns', 'references', 'read-tokens.js');
const { normalizeRaw } = await import(pathToFileURL(join(resolvePlugin('frontend-pack'), 'scripts', 'tokens-normalize.mjs')).href);

// read-tokens.js runs inside Figma; here it runs against a small fake of the plugin API.
test('read-tokens.js on a mocked Figma API resolves aliases and normalises into tokens.json shape', async () => {
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
  const alias = (id) => ({ type: 'VARIABLE_ALIAS', id });
  const c = (r, g, b, a = 1) => ({ r: r / 255, g: g / 255, b: b / 255, a });
  const colls = {
    P: { id: 'P', name: 'Primitives', key: 'kp', defaultModeId: 'p1', modes: [{ modeId: 'p1', name: 'Value' }], variableIds: ['g70', 'b0'] },
    T: { id: 'T', name: '2.theme', key: 'kt', defaultModeId: 'l', modes: [{ modeId: 'l', name: 'light' }, { modeId: 'd', name: 'dark' }], variableIds: ['td', 'tb'] },
    B: { id: 'B', name: '1.brand', key: 'kb', defaultModeId: 'm1', modes: [{ modeId: 'm1', name: 'bank' }, { modeId: 'm2', name: 'Аrtwin' }], variableIds: ['bd', 'rm'] },
  };
  const vars = {
    g70: { id: 'g70', name: 'green/70 solid', key: 'kg', resolvedType: 'COLOR', variableCollectionId: 'P', valuesByMode: { p1: c(22, 163, 74) } },
    b0: { id: 'b0', name: 'black/0 solid', key: 'k0', resolvedType: 'COLOR', variableCollectionId: 'P', valuesByMode: { p1: c(14, 15, 17, 0.95) } },
    td: { id: 'td', name: 'text/default', key: 'k1', resolvedType: 'COLOR', variableCollectionId: 'T', valuesByMode: { l: alias('b0'), d: c(240, 243, 244) } },
    tb: { id: 'tb', name: 'text/brand', key: 'k2', resolvedType: 'COLOR', variableCollectionId: 'T', valuesByMode: { l: alias('bd'), d: alias('bd') } },
    bd: { id: 'bd', name: 'brand/default', key: 'k3', resolvedType: 'COLOR', variableCollectionId: 'B', valuesByMode: { m1: alias('g70'), m2: c(253, 219, 43) } },
    rm: { id: 'rm', name: 'radius/m', key: 'k4', resolvedType: 'FLOAT', variableCollectionId: 'B', valuesByMode: { m1: 12, m2: 12 } },
  };
  const figma = {
    root: { name: 'Foundation' }, fileKey: 'F1',
    variables: {
      getLocalVariableCollectionsAsync: async () => [colls.T, colls.B],
      getVariableByIdAsync: async (id) => vars[id] ?? null,
      getVariableCollectionByIdAsync: async (id) => colls[id],
    },
    getLocalTextStylesAsync: async () => [{ name: 'font/Body/s', key: 'ks', fontName: { family: 'Inter Mbank', style: 'Regular' }, fontSize: 14, lineHeight: { unit: 'PERCENT', value: 142.857 } }],
    getLocalEffectStylesAsync: async () => [{ name: 'shadow/modal', key: 'ke', effects: [{ type: 'DROP_SHADOW', visible: true, offset: { x: 0, y: 18 }, radius: 30, spread: 0, color: c(0, 0, 0, 0.1) }] }],
  };
  const dump = await new AsyncFunction('figma', readFileSync(READER, 'utf8'))(figma);
  assert.equal(dump.format, 'mbank-figma-raw/1');
  const theme = dump.collections.find((x) => x.name === '2.theme').variables;
  assert.deepEqual(theme[0], { name: 'text/default', key: 'k1', type: 'COLOR', values: { light: '#0e0f11f2', dark: '#f0f3f4' }, alias: { light: 'black/0 solid', dark: null } });
  assert.equal(theme[1].values.light, '#16a34a', 'text/brand -> 1.brand default mode -> primitive');
  assert.equal(dump.effectStyles[0].effects[0].color, '#0000001a');

  const { tokens } = normalizeRaw([{ ...dump, kit: 'web' }], {});
  assert.deepEqual(tokens.theme.vars[1], { name: 'text/brand', key: 'k2', light: '#16a34a', dark: '#16a34a', aliasLight: 'brand/default' });
  assert.deepEqual(tokens.brand, { columns: ['bank', 'artwin'], vars: [{ name: 'brand/default', key: 'k3', values: ['#16a34a', '#fddb2b'] }], modes: ['bank', 'artwin'] });
  assert.deepEqual(tokens.brandRadius, { columns: ['value'], vars: [{ name: 'radius/m', key: 'k4', values: ['12'] }] });
  assert.deepEqual(tokens.textStyles.web, [{ name: 'font/Body/s', key: 'ks', family: 'Inter Mbank', style: 'Regular', size: 14, lineHeight: 20 }]);
  assert.deepEqual(tokens.effectStyles.web, [{ name: 'shadow/modal', key: 'ke', effects: 'DROP_SHADOW 0,18 r30' }]);
});
