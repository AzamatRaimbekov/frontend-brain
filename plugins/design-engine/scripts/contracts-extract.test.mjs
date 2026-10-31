import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { COMPONENTS, PATHS, extract, extractAll } from './contracts-extract.mjs';
import { checkContract } from './contracts-check.mjs';
import { resolvePlugin } from './resolve-plugin.mjs';
import { pathToFileURL } from 'node:url';

const { readTokens } = await import(pathToFileURL(join(resolvePlugin('frontend-pack'), 'scripts', 'contract-to-code', 'classes.mjs')).href);
const tokens = readTokens(PATHS.tokens);
const map = JSON.parse(readFileSync(PATHS.map, 'utf8'));

test('every configured kit component extracts to a contract that renders back to the same classes', () => {
  const results = extractAll();
  assert.ok(results.length >= 15);
  for (const name of ['button', 'badge', 'input', 'textarea', 'card', 'checkbox', 'switch', 'tabs-list', 'tabs-trigger', 'alert', 'avatar', 'skeleton', 'select-trigger', 'table-cell', 'pagination', 'progress'])
    assert.ok(results.some((r) => r.name === name), name);
  assert.deepEqual(results.filter((r) => r.diffs.length).map((r) => [r.name, r.diffs]), []);
  for (const r of results) assert.deepEqual(checkContract(r.contract, { tokens, map }).errors, [], r.name);
});

test('button: tokens, states and icon part become properties, behaviour stays in code.extra; figma from the map', () => {
  const button = extract(COMPONENTS.find((c) => c.name === 'button'), { tokens, map });
  assert.deepEqual(button.figma, { name: 'button/default', key: '713c90401df3b5d7ddf00e3af4d7ea5870c4c120', nodeId: '2077:341' });
  assert.deepEqual(button.variants.variant.primary.root, { bg: 'primary', fg: 'primary-foreground', 'bg:hover': 'primary-hover', 'bg:active': 'primary-active' });
  assert.deepEqual(button.variants.size.sm, { root: { height: 9, px: 3, text: 'sm' }, icon: { size: 4 } });
  assert.equal(button.base.root['focus-ring'], 'ring/50');
  assert.match(button.code.extra, /disabled:pointer-events-none/);
  assert.equal(button.code.extras['variant=link'], 'h-auto underline-offset-4 hover:underline');
  assert.deepEqual(button.states, ['default', 'hover', 'active', 'focus', 'disabled']);
});

test('a class that is not a contract property is kept verbatim in extras, so the round trip stays exact', () => {
  const dir = mkdtempSync(join(tmpdir(), 'extract-kit-'));
  try {
    cpSync(join(PATHS.kit, 'components'), join(dir, 'components'), { recursive: true });
    const file = join(dir, 'components', 'skeleton.tsx');
    writeFileSync(file, readFileSync(file, 'utf8').replace('"animate-pulse rounded-md', '"animate-pulse bg-primary/40 rounded-md'));
    const [r] = extractAll({ names: ['skeleton'], kit: dir });
    assert.deepEqual(r.diffs, []);
    assert.match(r.contract.code.extra, /bg-primary\/40/);
    assert.equal(r.contract.base.root.bg, 'surface-2');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
