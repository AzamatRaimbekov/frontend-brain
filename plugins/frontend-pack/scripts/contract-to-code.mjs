#!/usr/bin/env node
// Component contracts (mbank/component@1) -> cva code of the Mbank kit. frontend-pack owns code generation;
// the contracts are the consumer copy registry/mbank/contracts/*.json (owner: figma-pack, synced by design-engine).
// Usage:
//   node contract-to-code.mjs --check [name...]   compare generated class sets with the kit files, per variant/size,
//                                                 order-insensitive; exit 1 on drift
//   node contract-to-code.mjs --write <name>      regenerate only the blocks between // @contract <name> start/end
//   node contract-to-code.mjs --new <name>        scaffold components/<name>.tsx from the contract + registry.json item
//   options: --kit <registry dir> (default registry/mbank), --contracts <dir> (default <kit>/contracts), --json
// Pure Node 18+, no dependencies.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkSource, writeSource } from './contract-to-code/blocks.mjs';
import { registryItem, scaffold } from './contract-to-code/scaffold.mjs';

export const KIT = join(dirname(fileURLToPath(import.meta.url)), '..', 'registry', 'mbank');

export function loadContracts(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')));
}

const fileOf = (kit, contract) => join(kit, 'components', contract.code?.file ?? `${contract.name}.tsx`);

// [{ name, file, diffs }] for the given contracts (all when names is empty).
export function check({ kit = KIT, contracts = join(kit, 'contracts'), names = [] } = {}) {
  const all = loadContracts(contracts);
  const unknown = names.filter((n) => !all.some((c) => c.name === n));
  if (unknown.length) throw new Error(`no contract: ${unknown.join(', ')}`);
  return all
    .filter((c) => !names.length || names.includes(c.name))
    .map((c) => {
      const file = fileOf(kit, c);
      if (!existsSync(file)) return { name: c.name, file, diffs: [`${c.code?.file ?? c.name}: kit file missing (contract-to-code --new ${c.name})`] };
      return { name: c.name, file, diffs: checkSource(c, readFileSync(file, 'utf8')) };
    });
}

const find = (contracts, name) => {
  const c = loadContracts(contracts).find((x) => x.name === name);
  if (!c) throw new Error(`no contract ${name}.json in ${contracts}`);
  return c;
};

export function write({ kit = KIT, contracts = join(kit, 'contracts'), name }) {
  const c = find(contracts, name);
  const file = fileOf(kit, c);
  if (!existsSync(file)) throw new Error(`${file} does not exist; scaffold it with --new ${name}`);
  const before = readFileSync(file, 'utf8');
  const after = writeSource(c, before);
  if (after !== before) writeFileSync(file, after);
  return { name, file, changed: after !== before, diffs: checkSource(c, after) };
}

export function create({ kit = KIT, contracts = join(kit, 'contracts'), name }) {
  const c = find(contracts, name);
  const file = fileOf(kit, c);
  if (existsSync(file)) throw new Error(`${file} exists; use --write ${name}`);
  writeFileSync(file, scaffold(c));
  const registryFile = join(kit, 'registry.json');
  const registry = JSON.parse(readFileSync(registryFile, 'utf8'));
  if (!registry.items.some((i) => i.name === c.name)) {
    registry.items.push(registryItem(c));
    writeFileSync(registryFile, `${JSON.stringify(registry, null, 2)}\n`);
  }
  return { name, file, registry: registryFile, diffs: checkSource(c, readFileSync(file, 'utf8')) };
}

function main(argv) {
  const opt = (flag) => (argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : undefined);
  const kit = opt('--kit') ?? KIT;
  const contracts = opt('--contracts') ?? join(kit, 'contracts');
  const json = argv.includes('--json');
  const valued = new Set(['--kit', '--contracts', '--write', '--new']);
  const names = argv.filter((a, i) => !a.startsWith('--') && !valued.has(argv[i - 1]));
  try {
    if (opt('--write') || opt('--new')) {
      const res = opt('--write') ? write({ kit, contracts, name: opt('--write') }) : create({ kit, contracts, name: opt('--new') });
      if (json) console.log(JSON.stringify(res, null, 2));
      else {
        console.log(`${opt('--write') ? (res.changed ? 'written' : 'unchanged') : 'created'} ${res.file}`);
        if (res.registry) console.log(`registry item added to ${res.registry} (run registry-build.mjs)`);
        for (const d of res.diffs) console.log(`  DRIFT ${d}`);
      }
      return res.diffs.length ? 1 : 0;
    }
    if (!argv.includes('--check')) {
      console.error('usage: contract-to-code.mjs --check [name...] | --write <name> | --new <name> [--kit dir] [--contracts dir]');
      return 2;
    }
    const report = check({ kit, contracts, names });
    if (json) console.log(JSON.stringify(report, null, 2));
    else {
      for (const r of report) console.log(r.diffs.length ? `DRIFT ${r.name}\n${r.diffs.map((d) => `  ${d}`).join('\n')}` : `ok    ${r.name}`);
      if (!report.length) console.log(`no contracts in ${contracts}`);
    }
    return report.some((r) => r.diffs.length) ? 1 : 0;
  } catch (error) {
    console.error(error.message);
    return 2;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
