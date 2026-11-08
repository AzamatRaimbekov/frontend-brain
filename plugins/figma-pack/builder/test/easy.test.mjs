// «Просто» mode: clicks (screens, device, pieces) become a valid spec that builds without JSON.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createFigma, seedKit } from './figma-mock.mjs';
import { COLOR_TOKENS, EXTENSION_TOKENS } from '../core/tokens.js';
import { validateSpec, framePlan } from '../core/spec.js';
import { validateLinks } from '../core/links.js';
import { easySpec, screenTiles, pieceSamples, PIECES, SCREEN_INFO } from '../core/easy.js';

const base = JSON.parse(readFileSync(new URL('../examples/credit-crm.spec.json', import.meta.url)));
const valid = (spec) => [...validateSpec(spec), ...validateLinks(spec)];

test('every example screen has a friendly tile and every piece has a sample', () => {
  const tiles = screenTiles(base);
  assert.equal(tiles.length, base.screens.length);
  for (const t of tiles) assert.ok(SCREEN_INFO[t.id], `${t.id} has an emoji and a hint`);
  const samples = pieceSamples(base);
  for (const p of PIECES) assert.ok(samples[p.type], `piece ${p.type} has a sample block`);
});

test('picked screens build only those, with the chosen device and no extra states', () => {
  const { spec, only } = easySpec(base, { screens: ['login', 'apps', 'nope'], device: 'both', states: false, product: 'Мой банк' });
  assert.deepEqual(valid(spec), []);
  assert.deepEqual(only, ['login', 'apps'], 'unknown ids are dropped');
  assert.equal(spec.project, 'Мой банк');
  const plan = framePlan(spec).filter((f) => only.includes(f.screen));
  assert.equal(plan.length, 4, '2 screens × desktop+mobile × default only');
  assert.ok(plan.every((f) => f.state === 'default'));
  const withStates = easySpec(base, { screens: ['login'], device: 'desktop', states: true });
  assert.deepEqual(withStates.spec.screens.find((s) => s.id === 'login').states, ['default', 'error']);
});

test('a custom screen from pieces keeps the click order and gets a title', () => {
  const pieces = ['stats', 'table', 'alert', 'empty'];
  const { spec, only } = easySpec(base, { screens: [], device: 'desktop', custom: { title: 'Платежи', pieces } });
  assert.deepEqual(valid(spec), []);
  const mine = spec.screens.find((s) => s.id === only[0]);
  assert.equal(mine.title, 'Платежи');
  assert.deepEqual(mine.blocks.map((b) => b.type), ['header', ...pieces], 'a header is added on top');
  assert.equal(mine.blocks[0].title, 'Платежи');
  // samples are copies: editing the custom screen never touches the example
  mine.blocks[1].items.length = 0;
  assert.ok(pieceSamples(base).stats.items.length > 0);
});

test('every piece alone makes a valid screen', () => {
  for (const p of PIECES) {
    const { spec } = easySpec(base, { screens: [], custom: { title: p.label, pieces: [p.type] } });
    assert.deepEqual(valid(spec), [], p.type);
  }
});

test('the easy spec builds in the mock file: picked screens plus the custom one', async () => {
  const m = createFigma();
  globalThis.figma = m.figma;
  await seedKit(m.figma, COLOR_TOKENS.filter((t) => !EXTENSION_TOKENS.includes(t)));
  const brand = await import('../plugin/src/brand.js');
  await brand.setupBrand({ fixNames: true });
  const { vars, radius } = await brand.modeVars();
  const { buildSpec } = await import('../plugin/src/screens.js');
  const { spec, only } = easySpec(base, { screens: ['dashboard'], device: 'mobile', custom: { title: 'Платежи', pieces: ['toolbar', 'table', 'pagination'] } });
  const res = await buildSpec(spec, { vars, radius, kit: {}, font: 'Inter', prototype: false, only });
  assert.equal(res.frames.length, 2);
  assert.deepEqual([...new Set(res.frames.map((f) => f.page))].sort(), ['Обзор', 'Платежи']);
  for (const f of res.frames) assert.ok((await m.figma.getNodeByIdAsync(f.id)).width < 600, `${f.name}: phone width`);
});

test('the built window carries the script intact (no "$`" expanded into HTML)', () => {
  const html = readFileSync(new URL('../plugin/dist/ui.html', import.meta.url), 'utf8');
  const js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
  assert.equal(html.split('<script>').length, 2, 'exactly one inline script');
  assert.ok(!js.includes('<!doctype') && !js.includes('<nav>'), 'no page markup spliced into the script');
  assert.doesNotThrow(() => new Function(js), 'the script parses');
});
