// Contract token name (Mbank tokens.css name) -> Figma variable in this file.
// Order: Mode/<token> (shadcn kit with the Brand layer) -> baked Mbank map (Foundation file names)
// -> any variable named <token> or color/<token> -> the Mbank library variable imported by its baked key
// (a file that uses Foundation / Web components as a library, e.g. CRM UI KIT, has no local copies).
// Missing colours are created through brand.js (Mode + Brand, placeholder value, reported); missing
// radius/spacing stay numbers and are reported.
import { loadIndex, ensureModeColor, C } from './brand.js';
import { TOKEN_MAP } from '../../core/token-map.js';
import { STEP } from '../../core/contract.js';
import { cssVar } from '../../core/naming.js';
import { importByKey } from './library-import.js';

export async function tokenIndex() {
  const ix = await loadIndex();
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const colName = new Map(cols.map((c) => [c.id, c.name]));
  const all = [...ix.byId.values()];
  const byName = new Map();
  for (const v of all) {
    const list = byName.get(v.name) || [];
    list.push(v);
    byName.set(v.name, list);
  }
  return { ix, all, byName, colName, cache: new Map(), created: [], missing: [], imported: [] };
}

/** Library variable by its Figma name through the baked key (null when unknown or the library is off). */
async function libraryVar(t, name) {
  const key = name && TOKEN_MAP.keys && TOKEN_MAP.keys[name];
  if (!key || !figma.variables.importVariableByKeyAsync) return null;
  const v = await importByKey(() => figma.variables.importVariableByKeyAsync(key)); // null: library off or no access
  if (v && !t.imported.includes(name)) t.imported.push(name);
  return v;
}

function colorName(token, depth = 0) {
  const m = TOKEN_MAP.colors[token];
  if (m && m.alias && depth < 4) return colorName(m.alias, depth + 1);
  return m && m.figma;
}

function pick(t, name, type, collection) {
  const list = (t.byName.get(name) || []).filter((v) => v.resolvedType === type);
  if (!list.length) return null;
  return (collection && list.find((v) => (t.colName.get(v.variableCollectionId) || '').startsWith(collection))) || list[0];
}

// Project token (widget «Токены проекта»): mb-promo-surface -> custom/mb/promo-surface.
const projectVar = (token) => { const i = String(token).indexOf('-'); return i > 0 ? `custom/${token.slice(0, i)}/${token.slice(i + 1)}` : null; };

export function findColor(t, token, depth = 0) {
  const mode = t.ix.named[C.mode]?.get(token);
  if (mode && mode.resolvedType === 'COLOR') return mode;
  const m = TOKEN_MAP.colors[token];
  if (m && m.alias && depth < 4) return findColor(t, m.alias, depth + 1);
  if (m && m.figma) {
    // 1.brand slots are "brand/<slot>" in Foundation and in the widget; older maps name them "<slot>".
    const v = pick(t, m.figma, 'COLOR', m.collection) || (m.collection === '1.brand' && pick(t, `brand/${m.figma}`, 'COLOR', m.collection));
    if (v) return v;
  }
  return pick(t, token, 'COLOR') || pick(t, `color/${token}`, 'COLOR') || pick(t, projectVar(token), 'COLOR');
}

export function findRadius(t, key) {
  const style = t.ix.named[C.style]?.get(`radius/${key}`);
  if (style) return style;
  return (TOKEN_MAP.radius[key] && pick(t, TOKEN_MAP.radius[key], 'FLOAT')) || pick(t, `radius/${key}`, 'FLOAT') || pick(t, `rounded/${key}`, 'FLOAT') || pick(t, projectVar(key), 'FLOAT');
}

/** Spacing step (11 = 44 px): Tailwind spacing/<step>, web spacing/<px>, then the Mbank name (spacing/s-1 = 12 px). */
export function findSpace(t, step) {
  const s = String(step).replace('.', '-');
  const mbank = TOKEN_MAP.spacing && TOKEN_MAP.spacing[String(step * STEP)];
  return pick(t, `spacing/${step}`, 'FLOAT') || pick(t, `spacing/${s}`, 'FLOAT') || pick(t, `spacing/${step * STEP}`, 'FLOAT') || (mbank && pick(t, mbank, 'FLOAT'));
}

const libraryName = (kind, value) => (kind === 'radius' ? TOKEN_MAP.radius[value] : TOKEN_MAP.spacing && TOKEN_MAP.spacing[String(value * STEP)]);

const report = (t, kind, token) => { if (!t.missing.some((m) => m.kind === kind && m.token === token)) t.missing.push({ kind, token }); };

/** Colour variable for a token; creates it (reported in t.created) when the Brand layer exists. */
export async function colorVar(t, token, { create = true } = {}) {
  if (t.cache.has(`c:${token}`)) return t.cache.get(`c:${token}`);
  let v = findColor(t, token) || (await libraryVar(t, colorName(token)));
  if (!v && create) {
    const like = token.replace(/-(hover|active|disabled|muted)$/, '');
    v = await ensureModeColor(token, like !== token ? like : null);
    if (v) {
      t.created.push({ token, like: like !== token && t.ix.named[C.mode]?.has(like) ? like : null });
      t.ix.named[C.mode].set(token, v);
      t.byName.set(token, [v]);
    }
  }
  if (!v) report(t, 'color', token);
  t.cache.set(`c:${token}`, v || null);
  return v || null;
}

export async function floatVar(t, kind, value) {
  const key = `${kind}:${value}`;
  if (t.cache.has(key)) return t.cache.get(key);
  const v = (kind === 'radius' ? findRadius(t, value) : findSpace(t, value)) || (await libraryVar(t, libraryName(kind, value)));
  if (!v && !(kind === 'radius' && (value === 'full' || value === 'none'))) report(t, kind, String(value));
  t.cache.set(key, v || null);
  return v || null;
}

/** Variable -> contract token name (what «Привязки» writes back into the contract). */
export function tokenForVariable(v, collectionName) {
  if (collectionName === C.mode) return v.name.startsWith('custom/') ? cssVar(v.name).slice(2) : v.name;
  for (const [token, m] of Object.entries(TOKEN_MAP.colors)) if (m.figma === v.name && (!m.collection || collectionName.startsWith(m.collection))) return token;
  for (const [key, name] of Object.entries(TOKEN_MAP.radius)) if (name === v.name) return key;
  const r = /^(?:radius|rounded)\/(.+)$/.exec(v.name);
  if (r) return r[1];
  const s = /^spacing\/([\d.-]+)$/.exec(v.name);
  if (s) return Number(s[1].replace('-', '.'));
  for (const [px, name] of Object.entries(TOKEN_MAP.spacing || {})) if (name === v.name) return Number(px) / STEP;
  return v.name.replace(/^color\//, '').replace(/\//g, '-');
}

/** Variables for the token picker: colours and numbers, with the token name a contract would store. */
export async function listVariables() {
  const t = await tokenIndex();
  return t.all
    .filter((v) => v.resolvedType === 'COLOR' || v.resolvedType === 'FLOAT')
    .filter((v) => t.colName.get(v.variableCollectionId) !== C.brand) // Brand stays behind Mode
    .map((v) => {
      const collection = t.colName.get(v.variableCollectionId) || '';
      return { id: v.id, name: v.name, collection, type: v.resolvedType, token: tokenForVariable(v, collection), placeholder: v.getPluginData?.('ds') === 'contract-placeholder' };
    });
}

// shadcn tokens with no Mbank name of their own: the nearest Mbank role.
const SCREEN_ALIAS = {
  sidebar: 'background', 'sidebar-foreground': 'foreground', 'sidebar-primary': 'primary', 'sidebar-primary-foreground': 'primary-foreground',
  'sidebar-accent': 'accent', 'sidebar-accent-foreground': 'foreground', 'sidebar-border': 'border', 'sidebar-ring': 'ring',
  warning: 'status-warning', 'warning-foreground': 'foreground', info: 'status-info', 'info-foreground': 'foreground',
  // Charts take Mbank's supportive palette (five distinct hues); a file without it keeps the role colours.
  'chart-1': ['supportive-3', 'success'], 'chart-2': ['supportive-6', 'primary'], 'chart-3': ['supportive-2', 'status-accent'],
  'chart-4': ['supportive-7', 'secondary'], 'chart-5': ['supportive-4', 'muted-foreground'],
};

/**
 * Variables for screens: Mode/<token> of the shadcn kit (modeVars), else the Mbank variable of the same role
 * (Foundation names, local or from the library), so screens in an Mbank file bind to its tokens, not grey.
 */
export async function screenVars(base) {
  const t = await tokenIndex();
  const vars = { ...base.vars };
  const alias = (k) => [].concat(SCREEN_ALIAS[k] || []).reduce((v, a) => v || findColor(t, a), null);
  for (const k of Object.keys(vars)) if (!vars[k]) vars[k] = findColor(t, k) || alias(k) || null;
  const radius = { ...base.radius };
  for (const k of Object.keys(radius)) if (!radius[k]) radius[k] = findRadius(t, k) || null;
  return { vars, radius };
}
