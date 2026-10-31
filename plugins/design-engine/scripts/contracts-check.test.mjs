import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DEFAULTS, checkContract, checkDir } from './contracts-check.mjs';
import { resolvePlugin } from './resolve-plugin.mjs';

const { readTokens } = await import(pathToFileURL(join(resolvePlugin('frontend-pack'), 'scripts', 'contract-to-code', 'classes.mjs')).href);
const ctx = { tokens: readTokens(DEFAULTS.tokens), map: JSON.parse(readFileSync(DEFAULTS.map, 'utf8')) };
const button = () => JSON.parse(readFileSync(join(DEFAULTS.dir, 'button.json'), 'utf8'));
const errors = (c) => checkContract(c, { ...ctx, file: 'button.json' }).errors.join('\n');

test('the owner contracts in figma-pack are valid', () => {
  const report = checkDir();
  assert.ok(report.contracts >= 15);
  assert.deepEqual(report.errors, []);
});

test('a colour that is not a token in tokens.css is rejected', () => {
  const c = button();
  c.variants.variant.primary.root.bg = 'yellow-400';
  c.base.root['focus-ring'] = 'ring/abc';
  assert.match(errors(c), /variants\.variant\.primary\.root\.bg = "yellow-400": no such colour token/);
  assert.match(errors(c), /base\.root\.focus-ring = "ring\/abc"/);
});

test('props.values and variants must describe the same values', () => {
  const c = button();
  c.props.variant.values.push('neon');
  delete c.variants.size.lg;
  const text = errors(c);
  assert.match(text, /props\.variant: value "neon" has no variants\.variant\.neon/);
  assert.match(text, /variants\.size\.lg is not in props\.size\.values|props\.size: value "lg" has no variants\.size\.lg/);
});

test('unknown properties, parts, states and figma components are reported', () => {
  const c = button();
  c.base.root.colour = 'primary';
  c.base.label = { text: 'sm' };
  c.base.root['bg:pressed'] = 'primary';
  c.figma.key = 'nope';
  const text = errors(c);
  for (const re of [/unknown property "colour"/, /part "label" is not in parts/, /state "pressed" is not in states/, /figma\.key nope is not in components-map/]) assert.match(text, re);
});

test('a contract without figma is valid with a warning; the CLI exits 1 on errors', () => {
  const c = button();
  delete c.figma;
  const r = checkContract(c, { ...ctx, file: 'button.json' });
  assert.deepEqual(r.errors, []);
  assert.equal(r.warnings.length, 1);
  const dir = mkdtempSync(join(tmpdir(), 'contracts-'));
  try {
    c.variants.variant.primary.root.bg = '#fddb2b';
    writeFileSync(join(dir, 'button.json'), JSON.stringify(c));
    assert.deepEqual(checkDir({ dir }).errors.length, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
