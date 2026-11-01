// Bridge test: the Figma widget Mbank Tokens (figma-pack widget/core/exports.js) exports a raw dump
// that frontend-pack tokens-build.mjs --from turns back into the same tokens.json the widget exported.
// Run: node --test plugins/design-engine/scripts/widget-export.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolvePlugin } from './resolve-plugin.mjs';

const FIGMA = resolvePlugin('figma-pack');
const { exportTokensJson, rawDump } = await import(pathToFileURL(join(FIGMA, 'widget', 'core', 'exports.js')).href);
const { normalizeRaw, diffTokens } = await import(pathToFileURL(join(resolvePlugin('frontend-pack'), 'scripts', 'tokens-normalize.mjs')).href);
const { buildModel } = await import(pathToFileURL(join(resolvePlugin('frontend-pack'), 'scripts', 'tokens-build.mjs')).href);
const TOKENS = JSON.parse(readFileSync(join(FIGMA, 'skills', 'mbank-figma-patterns', 'references', 'tokens.json'), 'utf8'));
const MAP = JSON.parse(readFileSync(join(resolvePlugin('frontend-pack'), 'registry', 'mbank', 'tokens.map.json'), 'utf8'));

test('widget raw dump -> tokens-build --from gives the tokens.json the widget exported', () => {
  const state = {
    edits: { primary: { light: '#7c3aed', dark: '#8b5cf6' }, 'artwin:brand-hover': { light: '#e11d48', dark: '#f43f5e' }, 'radius-md': { light: 10, dark: 10 } },
    extras: [{ name: 'mb-promo', kind: 'color', light: '#fef3c7', dark: '#451a03' }],
  };
  const exported = exportTokensJson(TOKENS, state);
  const { tokens, updated, warnings } = normalizeRaw([rawDump(exported)], TOKENS);
  assert.deepEqual(updated.sort(), ['brand', 'brandRadius', 'theme']);
  assert.deepEqual(warnings, []);
  const diff = diffTokens(exported, tokens);
  // keys of new variables are unknown until Figma creates them; nothing else may differ.
  assert.deepEqual(diff.changed.filter((c) => c.field !== 'key'), []);
  assert.deepEqual([diff.added, diff.removed], [[], []]);
  assert.equal(tokens.brand.vars.find((v) => v.name === 'brand/hover').values[3], '#e11d48');
  // tokens-build accepts it: the CSS model builds with the edited values.
  const css = buildModel(tokens, MAP);
  assert.ok(css.blocks.length > 0);
});
