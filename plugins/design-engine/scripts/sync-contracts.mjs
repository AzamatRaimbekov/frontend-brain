#!/usr/bin/env node
// Contracts between figma-pack (owner) and frontend-pack (consumer copy), docs/architecture.md:
// Mbank tokens.json and the screen spec core (spec.js, fake.js). Only the engine updates the copies.
// Usage:
//   node sync-contracts.mjs            copy owner -> consumer where they differ, then rebuild tokens.css
//   node sync-contracts.mjs --check    exit 1 and list contracts whose copy differs (writes nothing)
//   node sync-contracts.mjs --json     report as JSON
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolvePlugin } from './resolve-plugin.mjs';

// The consumer copy of the spec core imports './fake.mjs' where the owner imports './fake.js'.
const toMjs = (text) => text.replace(/\.js'/g, ".mjs'");

export const CONTRACTS = [
  {
    id: 'tokens',
    owner: ['figma-pack', 'skills/mbank-figma-patterns/references/tokens.json'],
    copy: ['frontend-pack', 'registry/mbank/tokens.json'],
    after: ['frontend-pack', 'scripts/tokens-build.mjs'],
  },
  { id: 'spec-core', owner: ['figma-pack', 'builder/core/spec.js'], copy: ['frontend-pack', 'scripts/spec-to-code/spec.mjs'], transform: toMjs },
  { id: 'spec-fake', owner: ['figma-pack', 'builder/core/fake.js'], copy: ['frontend-pack', 'scripts/spec-to-code/fake.mjs'], transform: toMjs },
];

export function syncContracts({ check = false, resolve = resolvePlugin } = {}) {
  const roots = { 'figma-pack': resolve('figma-pack'), 'frontend-pack': resolve('frontend-pack') };
  const missing = Object.entries(roots).filter(([, dir]) => !dir).map(([name]) => name);
  if (missing.length) return { ok: false, missing, contracts: [] };
  const contracts = CONTRACTS.map((c) => {
    const ownerPath = join(roots[c.owner[0]], c.owner[1]);
    const copyPath = join(roots[c.copy[0]], c.copy[1]);
    if (!existsSync(ownerPath)) return { id: c.id, status: 'owner-missing', owner: ownerPath };
    const expected = (c.transform ?? ((t) => t))(readFileSync(ownerPath, 'utf8'));
    const actual = existsSync(copyPath) ? readFileSync(copyPath, 'utf8') : null;
    if (actual === expected) return { id: c.id, status: 'same' };
    if (check) return { id: c.id, status: 'differs', owner: ownerPath, copy: copyPath };
    writeFileSync(copyPath, expected);
    if (c.after) {
      const run = spawnSync(process.execPath, [join(roots[c.after[0]], c.after[1])], { encoding: 'utf8' });
      if (run.status !== 0) return { id: c.id, status: 'after-failed', output: run.stderr || run.stdout };
    }
    return { id: c.id, status: 'updated', copy: copyPath };
  });
  return { ok: contracts.every((c) => c.status === 'same' || c.status === 'updated'), missing, contracts };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = syncContracts({ check: process.argv.includes('--check') });
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else if (report.missing.length) console.error(`not installed: ${report.missing.join(', ')} (design-engine needs both packs)`);
  else for (const c of report.contracts) console.log(`${c.status.padEnd(13)} ${c.id}${c.copy ? `  ${c.copy}` : ''}${c.output ? `\n${c.output}` : ''}`);
  process.exit(report.ok ? 0 : 1);
}
