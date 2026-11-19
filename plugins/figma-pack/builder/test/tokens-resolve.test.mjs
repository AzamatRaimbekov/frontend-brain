// tokens-resolve.js: tokens resolve only to the «shadcn» collection (names = shadcn CSS names, radius-<key>);
// other collections are ignored, a missing shadcn token creates the collection, foreign names are reported.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFigma } from './figma-mock.mjs';

const setup = () => {
  const m = createFigma({ missingFonts: [] });
  globalThis.figma = m.figma;
  const col = (name) => m.figma.variables.createVariableCollection(name);
  const mk = (c, name, type = 'COLOR') => m.figma.variables.createVariable(name, c, type);
  return { ...m, col, mk };
};

test('colours and radius come from the shadcn collection only', async () => {
  const { col, mk } = setup();
  const other = col('Mode');
  mk(other, 'primary');
  mk(other, 'background');
  const shadcn = col('shadcn');
  const primary = mk(shadcn, 'primary');
  const radiusMd = mk(shadcn, 'radius-md', 'FLOAT');
  const radius = mk(shadcn, 'radius', 'FLOAT');
  const { findColor, findRadius, tokenIndex, tokenForVariable } = await import('../plugin/src/tokens-resolve.js');
  const t = await tokenIndex();
  assert.equal(findColor(t, 'primary').id, primary.id);
  assert.equal(findColor(t, 'background'), null, 'a variable of another collection is never used');
  assert.equal(findRadius(t, 'md').id, radiusMd.id);
  assert.equal(findRadius(t, 'default').id, radius.id);
  assert.equal(tokenForVariable(primary), 'primary');
  assert.equal(tokenForVariable(radiusMd), 'md');
});

test('a shadcn variable of the wrong type is skipped', async () => {
  const { col, mk } = setup();
  mk(col('shadcn'), 'primary', 'FLOAT');
  const { findColor, tokenIndex } = await import('../plugin/src/tokens-resolve.js');
  assert.equal(findColor(await tokenIndex(), 'primary'), null);
});

test('colorVar: a missing shadcn token creates the collection once; a foreign name is reported, never created', async () => {
  const m = setup();
  const { colorVar, floatVar, tokenIndex } = await import('../plugin/src/tokens-resolve.js');
  const { COLOR_TOKENS } = await import('../core/tokens.js');
  const t = await tokenIndex();
  assert.equal(await colorVar(t, 'muted', { create: false }), null);
  assert.equal(m.cols.size, 0, 'create: false leaves the file alone');
  const muted = await colorVar(t, 'muted');
  assert.equal(muted.name, 'muted');
  assert.equal(m.cols.get(muted.variableCollectionId).name, 'shadcn');
  assert.equal(t.created.length, COLOR_TOKENS.length);
  assert.equal((await colorVar(t, 'border')).name, 'border');
  assert.equal(m.cols.size, 1, 'one collection');
  assert.equal(await colorVar(t, 'status-muted'), null);
  assert.equal(await colorVar(t, 'brand'), null);
  assert.deepEqual(t.missing.filter((x) => x.kind === 'color').map((x) => x.token), ['status-muted', 'brand'], 'muted was found after all');
  assert.ok(![...m.vars.values()].some((v) => ['status-muted', 'brand'].includes(v.name)));
  assert.equal((await floatVar(t, 'radius', 'lg')).name, 'radius-lg');
  assert.equal(await floatVar(t, 'space', 4), null, 'spacing has no tokens');
  assert.equal(await floatVar(t, 'radius', 'full'), null);
  assert.ok(!t.missing.some((x) => x.kind === 'space' || x.token === 'full'));
});
