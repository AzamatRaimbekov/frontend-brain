// Contract / screen token name -> Figma variable of the «shadcn» collection (names = shadcn CSS names,
// radius as radius-<key>). Nothing else is looked up: no other collections, no libraries.
// A shadcn colour missing in the file is created with the whole collection (canonical values);
// a name that is not a shadcn token is reported and stays unbound. Spacing has no tokens in shadcn:
// paddings and gaps stay numbers.
import { COLLECTION, COLOR_TOKENS, RADIUS_KEYS } from '../../core/tokens.js';
import { loadIndex, ensureShadcn } from './variables.js';

export const SHADCN = COLLECTION;

export async function tokenIndex() {
  const ix = await loadIndex();
  return { ix, shadcn: ix.named[COLLECTION] || new Map(), cache: new Map(), created: [], missing: [], imported: [] };
}

/** Variable `name` of the shadcn collection with this type, or null. */
const fromShadcn = (t, name, type) => { const v = t.shadcn.get(name); return v && v.resolvedType === type ? v : null; };

export const findColor = (t, token) => fromShadcn(t, token, 'COLOR');

export const findRadius = (t, key) => fromShadcn(t, key === 'default' ? 'radius' : `radius-${key}`, 'FLOAT');

const report = (t, kind, token) => { if (!t.missing.some((m) => m.kind === kind && m.token === token)) t.missing.push({ kind, token }); };

// The collection is missing (or incomplete): create it once per index with the canonical values.
async function fillCollection(t) {
  if (t.filled) return;
  t.filled = true;
  const r = await ensureShadcn();
  if (!r.created.length) return;
  t.created.push(...r.created.filter((n) => COLOR_TOKENS.includes(n)).map((token) => ({ token, like: null })));
  t.shadcn = (await loadIndex()).named[COLLECTION];
}

/** Colour variable for a token; a missing shadcn token creates the collection (reported in t.created). */
export async function colorVar(t, token, { create = true } = {}) {
  if (t.cache.has(`c:${token}`)) return t.cache.get(`c:${token}`);
  let v = findColor(t, token);
  if (!v && create && COLOR_TOKENS.includes(token)) {
    await fillCollection(t);
    v = findColor(t, token);
  }
  if (!v) report(t, 'color', token);
  if (v || create) t.cache.set(`c:${token}`, v || null); // a create: false miss may be filled by a later call
  if (v) t.missing = t.missing.filter((x) => !(x.kind === 'color' && x.token === token));
  return v || null;
}

/** Radius variable (radius-<key>); spacing never has a variable. */
export async function floatVar(t, kind, value) {
  if (kind !== 'radius') return null;
  const key = `${kind}:${value}`;
  if (t.cache.has(key)) return t.cache.get(key);
  let v = findRadius(t, value);
  if (!v && RADIUS_KEYS.includes(String(value))) {
    await fillCollection(t);
    v = findRadius(t, value);
  }
  if (!v && !(value === 'full' || value === 'none')) report(t, kind, String(value));
  t.cache.set(key, v || null);
  return v || null;
}

/** Variable -> contract token name (what «Привязки» writes back into the contract). */
export function tokenForVariable(v) {
  return v.resolvedType === 'FLOAT' && /^radius-/.test(v.name) ? v.name.slice(7) : v.name;
}

/** Variables for the token picker: colours and radii of the shadcn collection. */
export async function listVariables() {
  const t = await tokenIndex();
  return [...t.shadcn.values()]
    .filter((v) => v.resolvedType === 'COLOR' || v.resolvedType === 'FLOAT')
    .map((v) => ({ id: v.id, name: v.name, collection: COLLECTION, type: v.resolvedType, token: tokenForVariable(v) }));
}

/** Variables for screens: fills the gaps of modeVars() from the collection (same source, kept for callers). */
export async function screenVars(base) {
  const t = await tokenIndex();
  const vars = { ...base.vars };
  for (const k of Object.keys(vars)) if (!vars[k]) vars[k] = findColor(t, k) || null;
  const radius = { ...base.radius };
  for (const k of Object.keys(radius)) if (!radius[k]) radius[k] = findRadius(t, k) || null;
  return { vars, radius };
}
