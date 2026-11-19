// The engine the agent runs through the Figma MCP (mcp/entry.js): screens bind to the «shadcn» collection,
// and the chunked bundle (mcp/bundle.mjs, needs esbuild) runs on the mock.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createFigma } from './figma-mock.mjs';

test('screen variables are the shadcn collection; nothing else is borrowed', async () => {
  const { figma } = createFigma({ missingFonts: [] });
  globalThis.figma = figma;
  const other = figma.variables.createVariableCollection('2.theme');
  figma.variables.createVariable('background', other, 'COLOR');
  const { screenVars } = await import('../plugin/src/tokens-resolve.js');
  const { modeVars, ensureShadcn } = await import('../plugin/src/variables.js');
  let { vars } = await screenVars(await modeVars());
  assert.equal(vars.background, null, 'another collection is not a source');
  await ensureShadcn();
  ({ vars } = await screenVars(await modeVars()));
  assert.equal(vars.background.name, 'background');
  assert.equal(vars['chart-2'].name, 'chart-2');
  assert.equal(vars.success, undefined, 'no status tokens');
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
  const tok = await run(`${pre}return DS.tokens()`);
  assert.equal(tok.collection, true);
  assert.equal(tok.created, 31 + 8, '31 colours + radius and radius-sm..4xl');
  assert.equal((await run(`${pre}return DS.tokens()`)).created, 0, 'a second run creates nothing');
  const comps = await run(`${pre}return DS.components(['badge','input'])`);
  assert.ok(comps.every((c) => c.setId && !c.errors));
  const spec = readFileSync(new URL('../examples/credit-crm.spec.json', import.meta.url), 'utf8');
  const scr = await run(`${pre}return DS.screens(${spec}, {theme:'light'})`);
  assert.equal(scr.errors, undefined);
  assert.ok(scr.frames > 20);
  assert.ok(scr.kit.includes('badge'));
  const proto = figma.root.children.find((p) => p.name === 'Прототип');
  assert.ok(proto, 'prototype page');
});
