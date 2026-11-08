// Screens are made of instances of the contract components: place(ctx, 'nav-item', …) finds the set built
// from that contract (plugin data "mbank-contract", any page), picks the variant, sets the «Label» property and
// other texts by layer name. Overrides only — the instance stays linked, so editing the component updates screens.
import { sizing, paint } from './draw.js';
import { KEY } from './components.js';

/** contract name -> { id, name } of its component set (or plain component) anywhere in the file. */
export async function contractRegistry() {
  await figma.loadAllPagesAsync();
  const out = {};
  for (const n of figma.root.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })) {
    const name = n.getPluginData(KEY);
    if (!name || (n.type === 'COMPONENT' && n.parent && n.parent.type === 'COMPONENT_SET')) continue;
    if (!out[name] || n.type === 'COMPONENT_SET') out[name] = { id: n.id, name: n.name };
  }
  return out;
}

/**
 * Counts a role as placed from the kit (true), drawn by hand (false) or stood in for by a more general
 * component ('stand-in': a plain Input where the Search input set is missing; not counted in the totals).
 */
export function count(ctx, role, ok) {
  const s = ctx.stats;
  if (!s.roles) s.roles = {};
  const r = (s.roles[role] = s.roles[role] || { instances: 0, fallbacks: 0, standIns: 0 });
  if (ok === 'stand-in') r.standIns++;
  else if (ok) { r.instances++; s.instances++; } else { r.fallbacks++; s.fallbacks++; }
}

const norm = (s) => String(s).toLowerCase().replace(/[\s_-]+/g, '');
const parse = (name) => Object.fromEntries(String(name).split(',').map((p) => p.split('=').map((x) => x.trim())).filter((p) => p.length === 2).map(([k, v]) => [k.toLowerCase(), v]));
const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();

// Variant whose values match the wanted ones; unmatched properties stay at the set's defaults.
function pickVariant(set, want) {
  const def = parse(set.defaultVariant ? set.defaultVariant.name : set.children[0].name);
  let best = null;
  let score = -1;
  for (const c of set.children) {
    if (c.type !== 'COMPONENT') continue;
    const p = parse(c.name);
    let s = 0;
    for (const [k, v] of Object.entries(want)) if (v != null && p[k.toLowerCase()] !== undefined && same(p[k.toLowerCase()], v)) s += 100;
    for (const [k, v] of Object.entries(def)) if (p[k] === v) s += 1;
    if (s > score) { best = c; score = s; }
  }
  return best;
}

async function mainOf(inst) {
  return inst.getMainComponentAsync ? inst.getMainComponentAsync() : inst.mainComponent;
}

async function loadFontsOf(t) {
  const n = t.characters ? t.characters.length : 0;
  const fonts = n && t.getRangeAllFontNames ? t.getRangeAllFontNames(0, n) : [t.fontName];
  for (const f of fonts) if (f && typeof f === 'object') await figma.loadFontAsync(f);
}

const textKey = (inst, name) => {
  const props = inst.componentProperties || {};
  return Object.keys(props).find((k) => props[k].type === 'TEXT' && norm(k.split('#')[0]) === norm(name)) || null;
};

async function setTextProp(inst, key, value) {
  for (const t of inst.findAll((n) => n.type === 'TEXT' && n.componentPropertyReferences && n.componentPropertyReferences.characters === key)) await loadFontsOf(t);
  inst.setProperties({ [key]: String(value) });
}

// Text by layer name ("Delta value" also finds "delta-value"); null / false hides the layer (any kind).
async function setLayer(ctx, inst, name, value) {
  const node = inst.findOne((n) => norm(n.name) === norm(name));
  if (!node) {
    const key = value != null && value !== false && textKey(inst, name);
    if (key) await setTextProp(inst, key, value);
    return !!key;
  }
  if (value === null || value === false) { node.visible = false; return true; }
  node.visible = true;
  if (node.type !== 'TEXT') return true;
  const ref = node.componentPropertyReferences && node.componentPropertyReferences.characters;
  if (ref) await setTextProp(inst, ref, value);
  else { await loadFontsOf(node); node.characters = String(value); }
  return true;
}

// Variant switch on an existing (nested) instance through its variant properties.
async function setVariant(inst, want) {
  const main = await mainOf(inst);
  const set = main && main.parent && main.parent.type === 'COMPONENT_SET' ? main.parent : null;
  if (!set) return;
  const defs = set.componentPropertyDefinitions;
  const out = {};
  for (const [k, d] of Object.entries(defs)) {
    if (d.type !== 'VARIANT') continue;
    const wk = Object.keys(want).find((w) => same(w, k));
    const hit = wk != null && want[wk] != null && d.variantOptions.find((o) => same(o, want[wk]));
    if (hit) out[k] = hit;
  }
  if (Object.keys(out).length) inst.setProperties(out);
}

/** Label property, texts by layer, text colours and nested instances on an instance (top level or nested). */
export async function configure(ctx, inst, o = {}) {
  if (o.label != null) {
    const key = textKey(inst, 'Label');
    if (key) await setTextProp(inst, key, o.label);
    else await setLayer(ctx, inst, 'Label', o.label);
  }
  for (const [name, value] of Object.entries(o.texts || {})) await setLayer(ctx, inst, name, value);
  for (const [name, token] of Object.entries(o.colors || {})) {
    const node = inst.findOne((n) => norm(n.name) === norm(name));
    if (node && token) node.fills = [paint(ctx, token)];
  }
  for (const [name, sub] of Object.entries(o.nested || {})) {
    const n = inst.findOne((x) => x.type === 'INSTANCE' && norm(x.name) === norm(name));
    if (!n) continue;
    if (sub.props) await setVariant(n, sub.props);
    await configure(ctx, n, sub);
  }
}

// Width / height: 'fill' | 'hug' | px. resize() fixes both axes: the axis not asked for goes back to hug when the
// component itself hugs there (a KPI card's height), and stays fixed when the component is fixed (an input's 44 px).
function size(inst, w, h) {
  const auto = inst.layoutMode && inst.layoutMode !== 'NONE';
  const row = inst.layoutMode === 'HORIZONTAL';
  const hugs = (horizontal) => auto && (row === horizontal ? inst.primaryAxisSizingMode : inst.counterAxisSizingMode) === 'AUTO';
  const hugW = hugs(true);
  const hugH = hugs(false);
  const fw = typeof w === 'number';
  const fh = typeof h === 'number';
  if (fw || fh) inst.resize(fw ? w : inst.width, fh ? h : inst.height);
  const sw = typeof w === 'string' ? w : !fw && fh && hugW ? 'hug' : undefined;
  const sh = typeof h === 'string' ? h : fw && !fh && hugH ? 'hug' : undefined;
  if (sw || sh) sizing(inst, sw, sh); // applied by add() once the instance is in an auto-layout parent
}

/**
 * Instance of the contract's component, or null when the file has no such set (the caller draws it and
 * counts the fallback). o: { props: { state, size, … }, label, texts: { 'Title': '…', 'Count': null }, colors,
 * nested: { 'Action': { label, props } }, w, h, role }.
 */
export async function place(ctx, name, o = {}) {
  const ref = ctx.sets && ctx.sets[name];
  if (!ref) return null;
  const cache = ctx.nodeCache || (ctx.nodeCache = new Map());
  if (!cache.has(ref.id)) cache.set(ref.id, await figma.getNodeByIdAsync(ref.id));
  const node = cache.get(ref.id);
  if (!node || node.removed) return null;
  const comp = node.type === 'COMPONENT_SET' ? pickVariant(node, o.props || {}) : node;
  if (!comp) return null;
  const inst = comp.createInstance();
  try {
    await configure(ctx, inst, o);
    size(inst, o.w, o.h);
  } catch (e) {
    inst.remove(); // e.g. the component's font is not installed: draw it instead
    const errs = ctx.stats.placeErrors || (ctx.stats.placeErrors = []);
    if (errs.length < 10) errs.push(`${name}: ${e && e.message ? e.message : e}`);
    return null;
  }
  count(ctx, o.role || name, true);
  return inst;
}

/** «nav-item 40/0 · table-cell 300/12 …» — instances / drawn by hand per role, hand-drawn first. */
export const handDrawn = (stats) => Object.entries(stats.roles || {}).filter(([, r]) => r.fallbacks).map(([role, r]) => ({ role, count: r.fallbacks }));

export function rolesReport(stats) {
  const rows = Object.entries(stats.roles || {}).sort((a, b) => b[1].fallbacks - a[1].fallbacks || a[0].localeCompare(b[0]));
  return rows.map(([role, r]) => `${role} ${r.instances}/${r.fallbacks}${r.standIns ? ` (+${r.standIns} заменой)` : ''}`).join(' · ');
}
