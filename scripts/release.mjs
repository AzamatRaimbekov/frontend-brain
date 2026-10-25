#!/usr/bin/env node
// Maintainer release: sets one version in all four manifests so installs pick up merged changes.
// Usage: node scripts/release.mjs <major|minor|patch|x.y.z>   then commit, tag and push.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = [
  'package.json',
  'plugins/frontend-pack/.claude-plugin/plugin.json',
  'plugins/frontend-pack/.codex-plugin/plugin.json',
  '.claude-plugin/marketplace.json',
];

const arg = process.argv[2];
const current = JSON.parse(readFileSync(join(ROOT, FILES[0]), 'utf8')).version;
const [major, minor, patch] = current.split('.').map(Number);
const next = { major: `${major + 1}.0.0`, minor: `${major}.${minor + 1}.0`, patch: `${major}.${minor}.${patch + 1}` }[arg]
  ?? (/^\d+\.\d+\.\d+$/.test(arg ?? '') ? arg : null);
if (!next) {
  console.error('usage: node scripts/release.mjs <major|minor|patch|x.y.z>');
  process.exit(1);
}

for (const file of FILES) {
  const path = join(ROOT, file);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  if ('version' in data) data.version = next;
  if (data.metadata) data.metadata.version = next;
  for (const plugin of data.plugins ?? []) if (plugin.name === 'frontend-pack') plugin.version = next;
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}
console.log(`${current} -> ${next}\nnext: npm test && git commit -am "frontend-pack ${next}" && git tag v${next} && git push --follow-tags`);
