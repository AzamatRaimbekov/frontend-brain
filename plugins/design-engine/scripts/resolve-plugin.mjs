#!/usr/bin/env node
// Finds the folder of another installed plugin (figma-pack, frontend-pack) for the design engine.
// Order: env FIGMA_PACK_DIR / FRONTEND_PACK_DIR, sibling in this repository (plugins/<name>),
// installed cache ~/.claude/plugins/cache/<marketplace>/<name>/<version> (highest version).
// Usage: node resolve-plugin.mjs <plugin-name>   (prints the path, exit 1 if not found)
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ENGINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const isPlugin = (dir, name) => existsSync(join(dir, '.claude-plugin', 'plugin.json')) && dir.split(/[\\/]/).includes(name);
const envName = (name) => `${name.replace(/-/g, '_').toUpperCase()}_DIR`;
const semver = (v) => v.split(/[.-]/).map((n) => Number.parseInt(n, 10) || 0);
const newer = (a, b) => {
  const [x, y] = [semver(a), semver(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  return 0;
};

export function resolvePlugin(name, { env = process.env, engine = ENGINE, home = homedir() } = {}) {
  if (env[envName(name)] && existsSync(join(env[envName(name)], '.claude-plugin', 'plugin.json'))) return env[envName(name)];
  // Repository checkout: plugins/design-engine next to plugins/<name>.
  const sibling = join(engine, '..', name);
  if (isPlugin(sibling, name)) return sibling;
  // Installed cache: <cache>/<marketplace>/<name>/<version>; the engine itself sits at <cache>/<marketplace>/design-engine/<version>.
  const cache = join(env.CLAUDE_CONFIG_DIR ?? join(home, '.claude'), 'plugins', 'cache');
  const marketplaces = existsSync(cache) ? readdirSync(cache) : [];
  const own = engine.split(/[\\/]/);
  const ownMarket = own[own.indexOf('cache') + 1];
  for (const market of [ownMarket, ...marketplaces.filter((m) => m !== ownMarket)].filter(Boolean)) {
    const dir = join(cache, market, name);
    if (!existsSync(dir)) continue;
    const versions = readdirSync(dir).filter((v) => existsSync(join(dir, v, '.claude-plugin', 'plugin.json'))).sort(newer);
    if (versions.length) return join(dir, versions.at(-1));
  }
  return null;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const name = process.argv[2];
  if (!name) {
    console.error('Usage: node resolve-plugin.mjs <plugin-name>');
    process.exit(2);
  }
  const dir = resolvePlugin(name);
  if (!dir) {
    console.error(`${name} not found: install it (claude plugin install ${name}@frontend-brain) or set ${envName(name)}`);
    process.exit(1);
  }
  console.log(dir);
}
