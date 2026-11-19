// What we know about the Mbank kits: catalog.json (this plugin), the design-engine components map (by arg/env,
// never by a path into another plugin) and the shadcn tokens (ds-tokens shadcn-tokens.json) for "nearest token"
// hints on raw hex.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

export const CATALOG_PATH = fileURLToPath(new URL('../../skills/mbank-design-system/references/catalog.json', import.meta.url));
export const TOKENS_PATH = fileURLToPath(new URL('../../skills/ds-tokens/references/shadcn-tokens.json', import.meta.url));
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
  // Library files (Foundation, Web components, CRM UI KIT …) define the kit: not product screens.
  const libraryFiles = new Set((catalog?.libraries || []).map((l) => l.fileKey).filter(Boolean));
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
    isLibraryFile: (key) => libraryFiles.has(key),
  };
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

// oklch(L C h [/ a]) -> sRGB 0..255 (OKLab -> linear sRGB -> gamma), clamped. Alpha is ignored for the hint.
function oklchToRgb(value) {
  const m = String(value).match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/);
  if (!m) return null;
  const L = Number(m[1]) / (m[2] ? 100 : 1);
  const C = Number(m[3]);
  const h = (Number(m[4]) * Math.PI) / 180;
  const [a, b] = [C * Math.cos(h), C * Math.sin(h)];
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ];
  return lin.map((x) => {
    const v = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, v)) * 255);
  });
}

/** A token value (oklch(...) or #rrggbb) -> #rrggbb, or null when it is something else (var(), calc()). */
export function toHex(value) {
  if (/^#[0-9a-f]{6}$/i.test(value || '')) return value.toLowerCase();
  const c = oklchToRgb(value);
  return c ? `#${c.map((x) => x.toString(16).padStart(2, '0')).join('')}` : null;
}

export const FAR = 12;

/** Raw hex -> { name, hex, exact, far, distance } from shadcn-tokens.json colours (light values), or null. */
export function nearestToken(hex, tokens) {
  let best = null;
  const [r, g, b] = rgb(hex.toLowerCase());
  for (const [name, v] of Object.entries(tokens?.colors || {})) {
    const light = toHex(v.light);
    if (!light) continue;
    const [r2, g2, b2] = rgb(light);
    const d = Math.round(Math.sqrt((r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2));
    if (!best || d < best.distance) best = { name, hex: light, distance: d };
  }
  // RGB distance above FAR means no token is close: report the colour as off-palette, not as a near miss.
  return best ? { ...best, exact: best.distance === 0, far: best.distance > FAR } : null;
}

/** Spacing in px -> Tailwind v4 spacing step (--spacing = 4px), e.g. 24 -> spacing*6; null off the scale. shadcn has no spacing tokens. */
export function spacingToken(value) {
  const step = Number(value) / 4;
  return Number.isInteger(step) || (step < 4 && Number.isInteger(step * 2)) ? `spacing*${step}` : null;
}
