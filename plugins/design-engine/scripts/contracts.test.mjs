import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolvePlugin, ENGINE } from './resolve-plugin.mjs';
import { syncContracts } from './sync-contracts.mjs';

const fakePlugin = (dir) => {
  mkdirSync(join(dir, '.claude-plugin'), { recursive: true });
  writeFileSync(join(dir, '.claude-plugin', 'plugin.json'), '{"name":"x"}');
  return dir;
};

test('contracts in the repository: frontend-pack copies equal their figma-pack owners', () => {
  const report = syncContracts({ check: true });
  assert.deepEqual(report.missing, []);
  assert.deepEqual(report.contracts.filter((c) => c.status !== 'same'), [], 'run: node plugins/design-engine/scripts/sync-contracts.mjs');
});

test('resolvePlugin finds the sibling in a checkout and the highest cached version when installed', () => {
  assert.match(resolvePlugin('figma-pack'), /plugins[\\/]figma-pack$/);
  const home = mkdtempSync(join(tmpdir(), 'engine-home-'));
  try {
    const cache = join(home, '.claude', 'plugins', 'cache', 'frontend-brain');
    const engine = fakePlugin(join(cache, 'design-engine', '0.1.0'));
    fakePlugin(join(cache, 'frontend-pack', '0.9.0'));
    fakePlugin(join(cache, 'frontend-pack', '0.14.0'));
    assert.equal(resolvePlugin('frontend-pack', { engine, home, env: {} }), join(cache, 'frontend-pack', '0.14.0'));
    assert.equal(resolvePlugin('figma-pack', { engine, home, env: {} }), null);
    const custom = fakePlugin(join(home, 'figma-pack'));
    assert.equal(resolvePlugin('figma-pack', { engine, home, env: { FIGMA_PACK_DIR: custom } }), custom);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('sync reports a missing pack instead of failing silently', () => {
  const report = syncContracts({ check: true, resolve: (name) => (name === 'figma-pack' ? null : join(ENGINE, '..', name)) });
  assert.equal(report.ok, false);
  assert.deepEqual(report.missing, ['figma-pack']);
});
