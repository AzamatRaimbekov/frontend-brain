// Free/Starter drafts allow one variable mode: apply writes Light and reports the limit once.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFigma } from '../../builder/test/figma-mock.mjs';
import TOKENS from '../../skills/ds-tokens/references/shadcn-tokens.json' with { type: 'json' };
import { buildModel } from '../core/model.js';
import { planWrites } from '../core/sync.js';
import { applyWrites } from '../src/figma-io.js';

test('a one-mode plan: variables are written in Light, the limit is one line, not one per variable', async () => {
  const { figma } = createFigma({ missingFonts: [] });
  const make = figma.variables.createVariableCollection;
  figma.variables.createVariableCollection = (name) => {
    const c = make(name);
    c.addMode = () => { throw new Error('in addMode: Limited to 1 modes only'); };
    return c;
  };
  globalThis.figma = figma;
  const plan = planWrites(buildModel(TOKENS), { all: true });
  const r = await applyWrites(plan.writes);
  assert.equal(r.created.length, 32, 'variables still created');
  assert.equal(r.errors.length, 1, r.errors.join('\n'));
  assert.match(r.errors[0], /разрешает 1 режим/);
  assert.deepEqual(r.modesAdded, []);
});
