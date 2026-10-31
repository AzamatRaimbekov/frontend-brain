// The Brand layer: Tailwind -> Style -> Brand -> Mode. Components keep binding
// to Mode; Mode now aliases Brand, and Brand inherits from Style unless a brand
// overrides a token. See docs/architecture.md.
import { COLOR_TOKENS, EXTENSION_TOKENS, scopesFor } from '../../core/tokens.js';
import { hexToRgb, rgbToHex } from '../../core/color.js';
import { snap } from '../../core/palette.js';
import { customName, cssVar, fixLegacyName } from '../../core/naming.js';

export const C = { tailwind: 'Tailwind', style: 'Style', mode: 'Mode', brand: 'Brand' };
const THEMES = ['light', 'dark'];
const EXT_DEFAULTS = {
  'destructive-foreground': ['white', 'white'], success: ['green/600', 'green/500'], 'success-foreground': ['white', 'green/950'],
  warning: ['amber/500', 'amber/400'], 'warning-foreground': ['amber/950', 'amber/950'], info: ['blue/600', 'blue/500'], 'info-foreground': ['white', 'white'],
};
const alias = (v) => figma.variables.createVariableAlias(v);
const isAlias = (x) => x && typeof x === 'object' && x.type === 'VARIABLE_ALIAS';
const rgba = (hex) => { const { r, g, b, a } = hexToRgb(hex); return { r, g, b, a }; };

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
  const palette = {};
  for (const [name, v] of named[C.tailwind] || []) {
    if (v.resolvedType !== 'COLOR' || !name.startsWith('colors/')) continue;
    const val = v.valuesByMode[col[C.tailwind].defaultModeId];
    if (!isAlias(val)) palette[name.slice(7)] = rgbToHex(val);
  }
  return { col, named, byId, palette };
}

const themeMode = (c, theme) => (c.modes.find((m) => (theme === 'dark' ? /dark/i : /light/i).test(m.name)) || c.modes[theme === 'dark' ? 1 : 0]).modeId;

export async function inspect() {
  const ix = await loadIndex();
  const mode = ix.col[C.mode];
  const brand = ix.col[C.brand];
  const out = {
    kit: !!(ix.col[C.style] && mode),
    collections: Object.keys(ix.col),
    brands: brand ? brand.modes.map((m) => m.name) : [],
    styles: ix.col[C.style] ? ix.col[C.style].modes.map((m) => m.name) : [],
    migrated: 0, total: 0, legacyNames: [], missingExtensions: [],
  };
  if (!mode) return out;
  for (const [name, v] of ix.named[C.mode]) {
    if (v.resolvedType !== 'COLOR') continue;
    out.total++;
    const val = v.valuesByMode[themeMode(mode, 'light')];
    if (isAlias(val) && brand && ix.byId.get(val.id)?.variableCollectionId === brand.id) out.migrated++;
    if (fixLegacyName(name) !== name) out.legacyNames.push(name);
  }
  out.missingExtensions = EXTENSION_TOKENS.filter((t) => !ix.named[C.mode].has(t));
  return out;
}

async function ensureBrandVar(ix, name, type = 'COLOR') {
  let v = ix.named[C.brand].get(name);
  if (!v) {
    v = figma.variables.createVariable(name, ix.col[C.brand], type);
    v.scopes = []; // designers pick Mode tokens; Brand stays out of pickers
    ix.named[C.brand].set(name, v);
    ix.byId.set(v.id, v);
  }
  return v;
}

const setAllModes = (ix, v, value) => { for (const m of ix.col[C.brand].modes) v.setValueForMode(m.modeId, value); };

function twAlias(ix, ref) {
  const v = ix.named[C.tailwind]?.get(`colors/${ref}`);
  return v ? alias(v) : rgba(ref === 'white' ? '#ffffff' : '#000000');
}

/** One-time migration. opts: { fixScopes, fixNames }. Safe to run again. */
export async function setupBrand(opts = {}) {
  const ix = await loadIndex();
  const mode = ix.col[C.mode];
  if (!mode || !ix.col[C.style]) throw new Error('Не найден shadcn-кит: нужны коллекции Style и Mode');
  if (!ix.col[C.brand]) {
    const b = figma.variables.createVariableCollection(C.brand);
    b.renameMode(b.modes[0].modeId, 'Base');
    ix.col[C.brand] = b;
    ix.named[C.brand] = new Map();
  }
  const brand = ix.col[C.brand];
  const report = { linked: 0, created: 0, renamed: 0, scoped: 0, extensions: [] };

  for (const [name, mv] of [...ix.named[C.mode]]) {
    if (mv.resolvedType !== 'COLOR') continue;
    const clean = opts.fixNames ? fixLegacyName(name) : name;
    if (clean !== name) { mv.name = clean; report.renamed++; }
    for (const theme of THEMES) {
      const mId = themeMode(mode, theme);
      const val = mv.valuesByMode[mId];
      const target = isAlias(val) ? ix.byId.get(val.id) : null;
      if (target && target.variableCollectionId === brand.id) continue; // already linked
      if (target && target.variableCollectionId === mode.id) continue; // internal Mode alias, keep
      const fromStyle = target && target.variableCollectionId === ix.col[C.style].id && target.name.startsWith(`color/${theme}/`);
      const bName = fromStyle ? target.name : `color/${theme}/${clean}`;
      const isNew = !ix.named[C.brand].has(bName);
      const bv = await ensureBrandVar(ix, bName);
      if (isNew) { setAllModes(ix, bv, val); report.created++; }
      mv.setValueForMode(mId, alias(bv));
      report.linked++;
    }
    mv.setVariableCodeSyntax('WEB', `var(${cssVar(clean)})`);
    if (opts.fixScopes) { mv.scopes = scopesFor(clean); report.scoped++; }
  }

  for (const t of EXTENSION_TOKENS) {
    if (ix.named[C.mode].has(t)) continue;
    const mv = figma.variables.createVariable(t, mode, 'COLOR');
    mv.setPluginData('ds', 'extension');
    for (const [i, theme] of THEMES.entries()) {
      const bv = await ensureBrandVar(ix, `color/${theme}/${t}`);
      setAllModes(ix, bv, twAlias(ix, EXT_DEFAULTS[t][i]));
      mv.setValueForMode(themeMode(mode, theme), alias(bv));
    }
    mv.scopes = scopesFor(t);
    mv.setVariableCodeSyntax('WEB', `var(--${t})`);
    ix.named[C.mode].set(t, mv);
    report.extensions.push(t);
  }

  for (const key of ['sans', 'heading']) {
    const name = `font/${key}`;
    if (ix.named[C.brand].has(name)) continue;
    const sv = ix.named[C.style].get(`font/family/${key}`);
    const fv = await ensureBrandVar(ix, name, 'STRING');
    setAllModes(ix, fv, sv ? alias(sv) : 'Inter');
  }
  return report;
}

/** Undo: Mode aliases go back to what Brand's Base mode held; Brand is removed. */
export async function rollbackBrand() {
  const ix = await loadIndex();
  const brand = ix.col[C.brand];
  const mode = ix.col[C.mode];
  if (!brand) return { restored: 0 };
  let restored = 0;
  for (const [, mv] of ix.named[C.mode]) {
    if (mv.getPluginData('ds') === 'extension') { mv.remove(); continue; }
    for (const theme of THEMES) {
      const mId = themeMode(mode, theme);
      const val = mv.valuesByMode[mId];
      const bv = isAlias(val) && ix.byId.get(val.id);
      if (bv && bv.variableCollectionId === brand.id) { mv.setValueForMode(mId, bv.valuesByMode[brand.defaultModeId]); restored++; }
    }
  }
  brand.remove();
  return { restored };
}

export async function addBrand(name) {
  const ix = await loadIndex();
  const b = ix.col[C.brand];
  if (!b) throw new Error('Сначала включите слой Brand');
  if (b.modes.some((m) => m.name === name)) throw new Error(`Бренд «${name}» уже есть`);
  const id = b.addMode(name);
  for (const [, v] of ix.named[C.brand]) v.setValueForMode(id, v.valuesByMode[b.defaultModeId]);
  return { modeId: id };
}

export async function removeBrand(name) {
  const ix = await loadIndex();
  const b = ix.col[C.brand];
  const m = b && b.modes.find((x) => x.name === name);
  if (!m || m.modeId === b.defaultModeId) throw new Error('Нельзя удалить Base или несуществующий бренд');
  b.removeMode(m.modeId);
}

// Follows aliases across collections; modes: { collectionId: modeId }.
function resolve(ix, v, modes, depth = 0) {
  const c = Object.values(ix.col).find((x) => x.id === v.variableCollectionId);
  const val = v.valuesByMode[modes[c.id] || c.defaultModeId];
  if (isAlias(val) && depth < 10) {
    const next = ix.byId.get(val.id);
    return next ? resolve(ix, next, modes, depth + 1) : null;
  }
  return val;
}

const describe = (ix, val) => {
  if (!isAlias(val)) return typeof val === 'object' ? rgbToHex(val) : val;
  const t = ix.byId.get(val.id);
  return t ? `→ ${t.name.replace(/^colors\//, '')}` : '→ ?';
};

/** Table for the UI: every color token x theme with raw value and resolved hex. */
export async function readBrand(brandName, styleName) {
  const ix = await loadIndex();
  const b = ix.col[C.brand];
  const bm = b.modes.find((m) => m.name === brandName) || b.modes[0];
  const sm = ix.col[C.style].modes.find((m) => m.name === styleName) || ix.col[C.style].modes[0];
  const modes = { [b.id]: bm.modeId, [ix.col[C.style].id]: sm.modeId };
  const rows = [];
  for (const token of COLOR_TOKENS) for (const theme of THEMES) {
    const bv = ix.named[C.brand].get(`color/${theme}/${token}`);
    if (!bv) continue;
    const raw = bv.valuesByMode[bm.modeId];
    const inherited = isAlias(raw) && ix.byId.get(raw.id)?.variableCollectionId === ix.col[C.style].id;
    const res = resolve(ix, bv, modes);
    rows.push({ token, theme, value: describe(ix, raw), hex: res && typeof res === 'object' ? rgbToHex(res) : null, inherited });
  }
  const font = ix.named[C.brand].get('font/sans');
  return { brand: bm.name, style: sm.name, rows, font: font ? resolve(ix, font, modes) : null, palette: ix.palette };
}

/** Writes a token set into one brand. keys: tokens to override; others reset to the style. */
export async function applyBrand(brandName, tokens, keys, opts = {}) {
  const ix = await loadIndex();
  const b = ix.col[C.brand];
  const bm = b.modes.find((m) => m.name === brandName);
  if (!bm) throw new Error(`Нет бренда «${brandName}»`);
  const out = [];
  for (const token of COLOR_TOKENS) for (const theme of THEMES) {
    const bv = ix.named[C.brand].get(`color/${theme}/${token}`);
    if (!bv) continue;
    const sv = ix.named[C.style].get(`color/${theme}/${token}`);
    if (!keys.includes(token)) {
      if (opts.reset && sv) bv.setValueForMode(bm.modeId, alias(sv));
      continue;
    }
    const hex = tokens.colors[theme][token];
    const hit = opts.snap === false ? null : snap(hex, ix.palette, opts.maxDE ?? 2.5);
    const tw = hit && ix.named[C.tailwind].get(`colors/${hit.name}`);
    bv.setValueForMode(bm.modeId, tw ? alias(tw) : rgba(hex));
    out.push({ token, theme, hex, alias: tw ? hit.name : null });
  }
  for (const [key, val] of [['sans', tokens.font?.sans], ['heading', tokens.font?.heading]]) {
    const fv = ix.named[C.brand].get(`font/${key}`);
    if (fv && val) fv.setValueForMode(bm.modeId, val);
  }
  return out;
}

/** Project token: Brand light/dark + Mode alias. value: 'amber/400' (Tailwind) or '#hex'. */
export async function addCustomToken({ project, role, light, dark, scopes }) {
  const ix = await loadIndex();
  if (!ix.col[C.brand]) throw new Error('Сначала включите слой Brand');
  const name = customName(project, role);
  const mode = ix.col[C.mode];
  const mv = ix.named[C.mode].get(name) || figma.variables.createVariable(name, mode, 'COLOR');
  for (const [theme, value] of [['light', light], ['dark', dark || light]]) {
    const bv = await ensureBrandVar(ix, `color/${theme}/${name}`);
    const tw = !String(value).startsWith('#') && ix.named[C.tailwind].get(`colors/${value}`);
    if (!tw && !String(value).startsWith('#')) throw new Error(`Нет цвета Tailwind «${value}»`);
    setAllModes(ix, bv, tw ? alias(tw) : rgba(value));
    mv.setValueForMode(themeMode(mode, theme), alias(bv));
  }
  mv.scopes = scopes?.length ? scopes : scopesFor(name);
  mv.setVariableCodeSyntax('WEB', `var(${cssVar(name)})`);
  return { name, css: cssVar(name) };
}

/** Project tokens resolved to hex for one brand + style: { 'mmarket-badge-bg-orange': { light, dark } }. */
export async function resolveCustom(brandName, styleName) {
  const ix = await loadIndex();
  const b = ix.col[C.brand];
  const s = ix.col[C.style];
  const modes = {
    [b.id]: (b.modes.find((m) => m.name === brandName) || b.modes[0]).modeId,
    [s.id]: (s.modes.find((m) => m.name === styleName) || s.modes[0]).modeId,
  };
  const out = {};
  for (const name of [...ix.named[C.mode].keys()].filter((n) => n.startsWith('custom/'))) {
    const entry = {};
    for (const theme of THEMES) {
      const bv = ix.named[C.brand].get(`color/${theme}/${name}`);
      const val = bv && resolve(ix, bv, modes);
      if (val && typeof val === 'object' && 'r' in val) entry[theme] = rgbToHex(val);
    }
    out[cssVar(name).slice(2)] = entry;
  }
  return out;
}

export async function listCustom() {
  const ix = await loadIndex();
  return [...(ix.named[C.mode] || new Map()).keys()].filter((n) => n.startsWith('custom/')).sort();
}

// Token -> Mode variable, for binding while building screens.
export async function modeVars() {
  const ix = await loadIndex();
  const vars = {};
  for (const t of COLOR_TOKENS) vars[t] = ix.named[C.mode]?.get(t) || null;
  const radius = {};
  for (const r of ['sm', 'md', 'lg', 'xl']) radius[r] = ix.named[C.style]?.get(`radius/${r}`) || null;
  radius.full = 999;
  return { vars, radius, ix };
}

/** Pins brand, style and theme on a frame so previews show the right look. */
export async function setFrameModes(frame, { brand, style, theme }) {
  const ix = await loadIndex();
  const pin = (name, test) => {
    const c = ix.col[name];
    const m = c && c.modes.find(test);
    if (m) frame.setExplicitVariableModeForCollection(c, m.modeId);
  };
  if (brand) pin(C.brand, (m) => m.name === brand);
  if (style) pin(C.style, (m) => m.name === style);
  if (theme) pin(C.mode, (m) => (theme === 'dark' ? /dark/i : /light/i).test(m.name));
}
