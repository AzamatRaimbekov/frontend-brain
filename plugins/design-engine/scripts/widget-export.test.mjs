// Bridge test: the Figma widget (figma-pack widget/core/exports.js) exports shadcn-tokens.json with the board's
// value edits; frontend-pack tokens-build.mjs accepts it and renders the same theme the widget's own tokens.css has.
// Only values change: the token names stay the standard shadcn set.
// Run: node --test plugins/design-engine/scripts/widget-export.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolvePlugin } from './resolve-plugin.mjs';

const FIGMA = resolvePlugin('figma-pack');
const load = (plugin, ...path) => import(pathToFileURL(join(resolvePlugin(plugin), ...path)).href);
const { exportTokensJson, tokensCss } = await load('figma-pack', 'widget', 'core', 'exports.js');
const { buildModel } = await load('figma-pack', 'widget', 'core', 'model.js');
const { validate, render, parseCss } = await load('frontend-pack', 'scripts', 'tokens-build.mjs');
const TOKENS = JSON.parse(readFileSync(join(FIGMA, 'skills', 'ds-tokens', 'references', 'shadcn-tokens.json'), 'utf8'));

const edits = { primary: { light: 'oklch(0.55 0.2 260)', dark: 'oklch(0.7 0.15 260)' }, radius: { light: '0.5rem' } };

test('widget export -> tokens-build: same shadcn names, edited values, valid for the code side', () => {
  const exported = exportTokensJson(TOKENS, { edits });
  assert.deepEqual(validate(exported), []);
  assert.deepEqual(Object.keys(exported.colors), Object.keys(TOKENS.colors), 'names never change');
  assert.deepEqual(exported.colors.primary, edits.primary);
  assert.equal(exported.radius, '0.5rem');
  assert.deepEqual(exported.colors.secondary, TOKENS.colors.secondary, 'unedited tokens keep the default');
  const css = parseCss(render(exported));
  assert.equal(css.get(':root').get('--primary'), edits.primary.light);
  assert.equal(css.get('.dark').get('--primary'), edits.primary.dark);
  assert.equal(css.get(':root').get('--radius'), '0.5rem');
});

test('the widget tokens.css and frontend-pack tokens.css agree on every :root and .dark value', () => {
  const exported = exportTokensJson(TOKENS, { edits });
  const widget = parseCss(tokensCss(exported, buildModel(exported)));
  const code = parseCss(render(exported));
  for (const selector of [':root', '.dark']) {
    const w = Object.fromEntries(widget.get(selector));
    const c = Object.fromEntries(code.get(selector));
    assert.deepEqual(w, c, selector);
  }
});
