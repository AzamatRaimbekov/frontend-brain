// Free/Starter drafts allow one variable mode: apply writes light + the first brand and reports the limit once.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFigma } from '../../builder/test/figma-mock.mjs';
import TOKENS from '../../skills/mbank-figma-patterns/references/tokens.json' with { type: 'json' };
import { buildModel, BRANDS } from '../core/model.js';
import { planAllBrands } from '../core/sync.js';
import { applyWrites } from '../src/figma-io.js';

test('a one-mode plan: variables are written, the limit is one line per collection, not one per variable', async () => {
  const { figma } = createFigma({ missingFonts: [] });
  const make = figma.variables.createVariableCollection;
  figma.variables.createVariableCollection = (name) => {
    const c = make(name);
    c.addMode = () => { throw new Error('in addMode: Limited to 1 modes only'); };
    return c;
  };
  globalThis.figma = figma;
  const plan = planAllBrands((b) => buildModel(TOKENS, { brand: b }), BRANDS, { all: true });
  const r = await applyWrites(plan.writes);
  assert.ok(r.created.length > 100, 'variables still created');
  assert.equal(r.errors.length, 2, [...new Set(r.errors.map((e) => e.replace(/[^:]*: /, '')))].slice(0, 5).join('\n'));
  assert.match(r.errors[0], /разрешает 1 режим/);
  assert.deepEqual(r.modesAdded, []);
});
