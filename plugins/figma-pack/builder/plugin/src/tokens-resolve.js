// Contract token name (Mbank tokens.css name) -> Figma variable in this file.
// Order: Mode/<token> (shadcn kit with the Brand layer) -> baked Mbank map (Foundation file names)
// -> any variable named <token> or color/<token>. Missing colours are created through brand.js
// (Mode + Brand, placeholder value, reported); missing radius/spacing stay numbers and are reported.
import { loadIndex, ensureModeColor, C } from './brand.js';
import { TOKEN_MAP } from '../../core/token-map.js';
import { STEP } from '../../core/contract.js';
import { cssVar } from '../../core/naming.js';

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
  return { ix, all, byName, colName, cache: new Map(), created: [], missing: [] };
}

function pick(t, name, type, collection) {
  const list = (t.byName.get(name) || []).filter((v) => v.resolvedType === type);
  if (!list.length) return null;
  return (collection && list.find((v) => (t.colName.get(v.variableCollectionId) || '').startsWith(collection))) || list[0];
}

export function findColor(t, token, depth = 0) {
  const mode = t.ix.named[C.mode]?.get(token);
  if (mode && mode.resolvedType === 'COLOR') return mode;
  const m = TOKEN_MAP.colors[token];
  if (m && m.alias && depth < 4) return findColor(t, m.alias, depth + 1);
  if (m && m.figma) { const v = pick(t, m.figma, 'COLOR', m.collection); if (v) return v; }
  return pick(t, token, 'COLOR') || pick(t, `color/${token}`, 'COLOR');
}

export function findRadius(t, key) {
  const style = t.ix.named[C.style]?.get(`radius/${key}`);
  if (style) return style;
  return (TOKEN_MAP.radius[key] && pick(t, TOKEN_MAP.radius[key], 'FLOAT')) || pick(t, `radius/${key}`, 'FLOAT') || pick(t, `rounded/${key}`, 'FLOAT');
}

/** Spacing step (11 = 44 px): Tailwind spacing/<step>, then web spacing/<px>. */
export function findSpace(t, step) {
  const s = String(step).replace('.', '-');
  return pick(t, `spacing/${step}`, 'FLOAT') || pick(t, `spacing/${s}`, 'FLOAT') || pick(t, `spacing/${step * STEP}`, 'FLOAT');
}

const report = (t, kind, token) => { if (!t.missing.some((m) => m.kind === kind && m.token === token)) t.missing.push({ kind, token }); };

/** Colour variable for a token; creates it (reported in t.created) when the Brand layer exists. */
export async function colorVar(t, token, { create = true } = {}) {
  if (t.cache.has(`c:${token}`)) return t.cache.get(`c:${token}`);
  let v = findColor(t, token);
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

export function floatVar(t, kind, value) {
  const key = `${kind}:${value}`;
  if (t.cache.has(key)) return t.cache.get(key);
  const v = kind === 'radius' ? findRadius(t, value) : findSpace(t, value);
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
