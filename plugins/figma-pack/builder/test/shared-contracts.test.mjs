// DS Builder and the Mbank Tokens widget share contracts through document sharedPluginData "mbank".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFigma } from './figma-mock.mjs';

test('a contract saved by DS Builder is in the shared store and wins over an old private copy', async () => {
  globalThis.figma = createFigma().figma;
  const { putContract, allContracts } = await import('../plugin/src/contracts.js');
  const bundled = [{ name: 'button', title: 'Button' }];
  figma.root.setPluginData('contract:button', JSON.stringify({ name: 'button', title: 'old private copy' }));
  putContract({ name: 'button', title: 'Button edited' });
  assert.equal(JSON.parse(figma.root.getSharedPluginData('mbank', 'contract:button')).title, 'Button edited');
  assert.equal(figma.root.getPluginData('contract:button'), '', 'the private copy is cleared');
  const hit = allContracts(bundled).get('button');
  assert.equal(hit.contract.title, 'Button edited');
  assert.equal(hit.source, 'edited');
  // a contract the widget created appears in DS Builder
  figma.root.setSharedPluginData('mbank', 'contract:tag', JSON.stringify({ name: 'tag', title: 'Tag' }));
  assert.equal(allContracts(bundled).get('tag').source, 'file');
});
