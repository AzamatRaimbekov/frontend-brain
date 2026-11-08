// tokens-resolve.js: the `shadcn` collection the Mbank Tokens widget pulls from the design-system site
// wins over Mode/<token> and the Foundation names; without it the old chain still works.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFigma } from './figma-mock.mjs';

const setup = () => {
  const { figma } = createFigma({ missingFonts: [] });
  globalThis.figma = figma;
  const col = (name) => figma.variables.createVariableCollection(name);
  const mk = (c, name, type = 'COLOR') => figma.variables.createVariable(name, c, type);
  return { figma, col, mk };
};

test('shadcn/<token> is preferred for colours, radius and project tokens', async () => {
  const { col, mk } = setup();
  const theme = col('2.theme');
  const mode = col('Mode');
  const foundation = mk(theme, 'accent/primary/default');
  mk(mode, 'primary');
  const legacyPromo = mk(theme, 'custom/mb/promo');
  const radiusFoundation = mk(col('1.brand'), 'radius/m', 'FLOAT');
  const shadcn = col('shadcn');
  const primary = mk(shadcn, 'primary');
  const promo = mk(shadcn, 'mb-promo');
  const radiusMd = mk(shadcn, 'radius-md', 'FLOAT');
  const { findColor, findRadius, tokenIndex, tokenForVariable, SHADCN } = await import('../plugin/src/tokens-resolve.js');
  const t = await tokenIndex();
  assert.equal(findColor(t, 'primary').id, primary.id, 'shadcn/primary before Mode/primary and 2.theme');
  assert.equal(findColor(t, 'mb-promo').id, promo.id, 'project token from the site before custom/mb/promo');
  assert.notEqual(findColor(t, 'mb-promo').id, legacyPromo.id);
  assert.equal(findRadius(t, 'md').id, radiusMd.id, 'radius-md of shadcn before radius/m of 1.brand');
  assert.notEqual(findRadius(t, 'md').id, radiusFoundation.id);
  assert.equal(findColor(t, 'background'), null, 'a token the collection lacks falls through the chain (nothing here)');
  assert.equal(tokenForVariable(primary, SHADCN), 'primary');
  assert.equal(tokenForVariable(radiusMd, SHADCN), 'md');
  void foundation;
});

test('a shadcn variable of the wrong type is skipped; no collection keeps the old order', async () => {
  const { col, mk } = setup();
  const theme = col('2.theme');
  const foundation = mk(theme, 'accent/primary/default');
  const mode = col('Mode');
  const modePrimary = mk(mode, 'primary');
  const { findColor, tokenIndex } = await import('../plugin/src/tokens-resolve.js');
  let t = await tokenIndex();
  assert.equal(findColor(t, 'primary').id, modePrimary.id, 'without shadcn: Mode first, as before');
  mk(col('shadcn'), 'primary', 'FLOAT');
  t = await tokenIndex();
  assert.equal(findColor(t, 'primary').id, modePrimary.id, 'a FLOAT named primary is not a colour');
  void foundation;
});
