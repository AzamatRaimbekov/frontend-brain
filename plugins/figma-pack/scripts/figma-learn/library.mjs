// What we know about the Mbank kits: catalog.json (this plugin), the design-engine components map (by arg/env,
// never by a path into another plugin) and tokens.json for "nearest token" hints on raw hex.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

export const CATALOG_PATH = fileURLToPath(new URL('../../skills/mbank-design-system/references/catalog.json', import.meta.url));
export const TOKENS_PATH = fileURLToPath(new URL('../../skills/mbank-figma-patterns/references/tokens.json', import.meta.url));
export const MAP_ENV = 'FIGMA_LEARN_COMPONENTS_MAP';

const read = (p) => (p && existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);

/**
 * Components map of design-engine: --map <file> > $FIGMA_LEARN_COMPONENTS_MAP > $DESIGN_ENGINE_DIR/references/...
 * > newest installed design-engine in ~/.claude/plugins/cache. Returns { map, path } or { map: null }.
 */
export function findComponentsMap(arg, env = process.env) {
  const candidates = [arg, env[MAP_ENV], env.DESIGN_ENGINE_DIR && join(env.DESIGN_ENGINE_DIR, 'references', 'components-map.json')];
  const cache = join(homedir(), '.claude', 'plugins', 'cache');
  if (existsSync(cache)) {
    for (const market of readdirSync(cache)) {
      const dir = join(cache, market, 'design-engine');
      if (!existsSync(dir)) continue;
      const versions = readdirSync(dir).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      if (versions.length) candidates.push(join(dir, versions.at(-1), 'references', 'components-map.json'));
    }
  }
  for (const path of candidates.filter(Boolean)) if (existsSync(path)) return { map: read(path), path };
  return { map: null, path: null };
}

export const loadCatalog = (path = CATALOG_PATH) => read(path);
export const loadTokens = (path = TOKENS_PATH) => read(path);

// Catalog names too generic to call a frame "detached" just by its name.
const GENERIC = new Set(['header', 'footer', 'chart', 'content', 'overlay', 'atoms', 'card', 'segment', 'tooltip', 'scroll', 'cursor', 'hint', 'spinner', 'toast', 'marks', 'slider', 'accordion', 'otp']);

export function libraryIndex({ catalog = null, map = null } = {}) {
  const byKey = new Map();
  for (const c of [...(catalog?.components || []), ...(catalog?.blocks || [])]) {
    if (!c.key || (byKey.has(c.key) && !c.code?.web?.status)) continue; // blocks repeat components without a code status
    byKey.set(c.key, { name: c.name, status: c.code?.web?.status || 'in-catalog', kit: c.kit });
  }
  for (const m of map?.components || []) if (m.key) byKey.set(m.key, { ...(byKey.get(m.key) || {}), name: m.figma, status: m.status, kit: m.kit });
  const names = new Set();
  for (const c of [...(catalog?.components || []), ...(catalog?.blocks || []), ...(map?.components || [])]) {
    const n = String(c.name || c.figma || '').toLowerCase();
    if (n.length >= 5 && !GENERIC.has(n) && !/^frame \d+/.test(n)) names.add(n);
  }
  return {
    hasCatalog: Boolean(catalog),
    hasMap: Boolean(map),
    status: (key) => (key && byKey.get(key)?.status) || 'unknown',
    entry: (key) => byKey.get(key) || null,
    isComponentName: (name) => names.has(String(name).toLowerCase()),
  };
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** Raw hex -> { name, hex, exact, distance } from tokens.json 2.theme (light values), or null. */
export function nearestToken(hex, tokens) {
  const vars = tokens?.theme?.vars || [];
  let best = null;
  const [r, g, b] = rgb(hex.toLowerCase());
  for (const v of vars) {
    if (!/^#[0-9a-f]{6}$/i.test(v.light || '')) continue;
    const [r2, g2, b2] = rgb(v.light.toLowerCase());
    const d = Math.round(Math.sqrt((r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2));
    if (!best || d < best.distance) best = { name: v.name, hex: v.light.toLowerCase(), distance: d };
  }
  return best ? { ...best, exact: best.distance === 0 } : null;
}

/** Spacing value -> web token name (tokens.json webSpacing), e.g. 24 -> spacing/l-2. */
export function spacingToken(value, tokens) {
  const hit = (tokens?.webSpacing?.vars || []).find((v) => Number(v.values?.[0]) === Number(value));
  return hit?.name || null;
}
