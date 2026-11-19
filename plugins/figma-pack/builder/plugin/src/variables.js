// Figma variables of the design system: one collection «shadcn» (modes Light / Dark), names = the
// shadcn CSS variable names, raw values from core/tokens.js (the canonical shadcn-tokens.json).
// Components and screens bind only to these variables. See docs/architecture.md.
import { COLLECTION, COLOR_TOKENS, THEMES, RADIUS, radiusScale, rgbaOf, scopesFor, SHADCN_TOKENS } from '../../core/tokens.js';
import { rgbaToOklch } from '../../core/color.js';

const isAlias = (x) => x && typeof x === 'object' && x.type === 'VARIABLE_ALIAS';

// One pass over all local variables; everything else reads from this index.
export async function loadIndex() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  const byId = new Map(vars.map((v) => [v.id, v]));
  const col = {};
  for (const c of cols) col[c.name] = c;
  const named = {};
  for (const c of cols) named[c.name] = new Map();
  for (const v of vars) {
    const c = cols.find((x) => x.id === v.variableCollectionId);
    if (c) named[c.name].set(v.name, v);
  }
  return { col, named, byId };
}

export const themeMode = (c, theme) => (c.modes.find((m) => (theme === 'dark' ? /dark/i : /light/i).test(m.name)) || c.modes[theme === 'dark' ? 1 : 0] || c.modes[0]).modeId;

/** Collection state for the window: does it exist, which names are missing. */
export async function inspect() {
  const ix = await loadIndex();
  const c = ix.col[COLLECTION];
  const have = ix.named[COLLECTION] || new Map();
  return {
    collection: !!c,
    modes: c ? c.modes.map((m) => m.name) : [],
    colors: COLOR_TOKENS.filter((t) => have.has(t)).length,
    total: COLOR_TOKENS.length,
    missing: [...COLOR_TOKENS, 'radius'].filter((t) => !have.has(t)),
    collections: Object.keys(ix.col),
  };
}

const radiusValues = () => {
  const s = radiusScale(RADIUS);
  return [['radius', RADIUS], ...Object.entries(s).map(([k, v]) => [`radius-${k}`, v])];
};

/**
 * Creates the «shadcn» collection and every missing variable with the canonical value.
 * opts.reset: also overwrite existing values with the canonical ones. Safe to run again.
 */
export async function ensureShadcn(opts = {}) {
  const ix = await loadIndex();
  let c = ix.col[COLLECTION];
  const report = { created: [], reset: 0, collection: false };
  if (!c) {
    c = figma.variables.createVariableCollection(COLLECTION);
    c.renameMode(c.modes[0].modeId, 'Light');
    c.addMode('Dark');
    ix.col[COLLECTION] = c;
    ix.named[COLLECTION] = new Map();
    report.collection = true;
  } else if (c.modes.length < 2) c.addMode('Dark');
  const named = ix.named[COLLECTION];
  const make = (name, type) => {
    const v = figma.variables.createVariable(name, c, type);
    v.setVariableCodeSyntax('WEB', `var(--${name})`);
    named.set(name, v);
    ix.byId.set(v.id, v);
    report.created.push(name);
    return v;
  };
  for (const token of COLOR_TOKENS) {
    const fresh = !named.has(token);
    const v = named.get(token) || make(token, 'COLOR');
    if (fresh) v.scopes = scopesFor(token);
    if (fresh || opts.reset) {
      for (const theme of THEMES) v.setValueForMode(themeMode(c, theme), rgbaOf(token, theme));
      if (!fresh) report.reset++;
    }
  }
  for (const [name, px] of radiusValues()) {
    const fresh = !named.has(name);
    const v = named.get(name) || make(name, 'FLOAT');
    if (fresh) v.scopes = ['CORNER_RADIUS'];
    if (fresh || opts.reset) for (const m of c.modes) v.setValueForMode(m.modeId, px);
  }
  return report;
}

// Follows aliases inside the file; null for a broken chain.
function resolve(ix, v, theme, depth = 0) {
  const c = Object.values(ix.col).find((x) => x.id === v.variableCollectionId);
  const val = c && v.valuesByMode[themeMode(c, theme)];
  if (isAlias(val)) {
    const next = depth < 10 && ix.byId.get(val.id);
    return next ? resolve(ix, next, theme, depth + 1) : null;
  }
  return val == null ? null : val;
}

/** Current values of the collection in the canonical shape (oklch strings) + missing names. */
export async function readShadcn() {
  const ix = await loadIndex();
  const named = ix.named[COLLECTION] || new Map();
  const colors = {};
  const missing = [];
  for (const token of COLOR_TOKENS) {
    const v = named.get(token);
    const entry = {};
    for (const theme of THEMES) {
      const val = v && resolve(ix, v, theme);
      if (val && typeof val === 'object' && 'r' in val) entry[theme] = rgbaToOklch(val);
    }
    if (entry.light && entry.dark) colors[token] = entry;
    else { colors[token] = { ...SHADCN_TOKENS.colors[token], ...entry }; missing.push(token); }
  }
  const r = named.get('radius');
  const px = r ? resolve(ix, r, 'light') : RADIUS;
  return {
    $schema: SHADCN_TOKENS.$schema,
    radius: `${Math.round((Number(px) / 16) * 1000) / 1000}rem`,
    radiusScale: SHADCN_TOKENS.radiusScale,
    font: SHADCN_TOKENS.font,
    colors,
    missing,
  };
}

/** Token -> variable of the collection, for binding while building screens (null when absent). */
export async function modeVars() {
  const ix = await loadIndex();
  const named = ix.named[COLLECTION] || new Map();
  const vars = {};
  for (const t of COLOR_TOKENS) vars[t] = named.get(t) || null;
  const radius = {};
  for (const k of ['sm', 'md', 'lg', 'xl']) radius[k] = named.get(`radius-${k}`) || null;
  radius.full = 999;
  return { vars, radius, ix };
}

/** Pins the theme (Light/Dark mode of «shadcn») on a frame so previews show the right look. */
export async function setFrameModes(frame, { theme } = {}) {
  if (!theme) return;
  const ix = await loadIndex();
  const c = ix.col[COLLECTION];
  if (c) frame.setExplicitVariableModeForCollection(c, themeMode(c, theme));
}
