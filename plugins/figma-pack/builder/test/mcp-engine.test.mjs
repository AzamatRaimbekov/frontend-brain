// The engine the agent runs through the Figma MCP (mcp/entry.js): screens in an Mbank file bind to its
// Foundation variables, and the chunked bundle (mcp/bundle.mjs, needs esbuild) runs on the mock.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createFigma } from './figma-mock.mjs';

test('screen variables fall back to Mbank Foundation names, aliases and project tokens', async () => {
  const { figma } = createFigma({ missingFonts: [] });
  globalThis.figma = figma;
  const theme = figma.variables.createVariableCollection('2.theme');
  const mk = (name, type = 'COLOR') => figma.variables.createVariable(name, theme, type);
  const primary = mk('accent/primary/default');
  const bg = mk('background/surface/light');
  const promo = mk('custom/crm/highlight');
  const blue = mk('supportive/filled/6');
  const { screenVars, findColor, tokenIndex } = await import('../plugin/src/tokens-resolve.js');
  const { vars } = await screenVars({ vars: { primary: null, sidebar: null, 'chart-2': null, 'chart-4': null, unknown: null }, radius: { full: 999 } });
  assert.equal(vars.primary.id, primary.id);
  assert.equal(vars.sidebar.id, bg.id, 'sidebar has no Mbank name: the nearest role (background)');
  assert.equal(vars['chart-2'].id, blue.id, 'charts take the supportive palette');
  assert.equal(vars['chart-4'], null, 'neither supportive/filled/7 nor secondary in this file');
  assert.equal(vars.unknown, null);
  assert.equal(findColor(await tokenIndex(), 'crm-highlight').id, promo.id, 'project token crm-highlight -> custom/crm/highlight');
});

const esbuild = ['node_modules/esbuild', '../widget/node_modules/esbuild'].map((p) => new URL(`../${p}`, import.meta.url)).find((u) => existsSync(u));

test('MCP bundle: chunks under the use_figma limit, hashes match, engine builds tokens, components and screens', { skip: !esbuild && 'esbuild not installed (npm i in builder)' }, async () => {
  const out = mkdtempSync(join(tmpdir(), 'mcp-'));
  const r = spawnSync(process.execPath, [new URL('../mcp/bundle.mjs', import.meta.url).pathname, out], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const loads = readdirSync(out).filter((f) => f.endsWith('-load.js')).sort();
  const hashes = JSON.parse(readFileSync(join(out, 'hashes.json'), 'utf8'));
  const { figma } = createFigma({ missingFonts: [] });
  globalThis.figma = figma;
  const run = (code) => new (async () => {}).constructor(code)();
  for (const [i, f] of loads.entries()) {
    const code = readFileSync(join(out, f), 'utf8');
    assert.ok(code.length <= 50000, `${f} is ${code.length} chars`);
    assert.equal((await run(code)).hash, hashes[i]);
  }
  const pre = readFileSync(join(out, 'run.js'), 'utf8');
  const tok = await run(`${pre}return DS.tokens({extras:[{name:'crm-highlight',kind:'color',light:'#FFD500',dark:'#E6C000'}]})`);
  assert.deepEqual(tok.errors, []);
  assert.ok(tok.created > 100);
  const comps = await run(`${pre}return DS.components(['badge','input'])`);
  assert.ok(comps.every((c) => c.setId && !c.errors));
  const spec = readFileSync(new URL('../examples/credit-crm.spec.json', import.meta.url), 'utf8');
  const scr = await run(`${pre}return DS.screens(${spec}, {brand:'bank'})`);
  assert.equal(scr.errors, undefined);
  assert.ok(scr.frames > 20);
  assert.ok(scr.kit.includes('badge'));
  const proto = figma.root.children.find((p) => p.name === 'Прототип');
  assert.ok(proto, 'prototype page');
});

test('brand slots resolve as brand/<slot> in 1.brand (Foundation and widget naming)', async () => {
  const { figma } = createFigma({ missingFonts: [] });
  globalThis.figma = figma;
  const brand = figma.variables.createVariableCollection('1.brand');
  const v = figma.variables.createVariable('brand/default', brand, 'COLOR');
  const { findColor, tokenIndex } = await import('../plugin/src/tokens-resolve.js');
  assert.equal(findColor(await tokenIndex(), 'brand').id, v.id);
});
