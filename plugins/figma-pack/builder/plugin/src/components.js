// Contract -> component set on the page «Components». One variant per props x states, auto layout
// from the contract, every token property bound to a variable. Re-running updates the set in place:
// variant components keep their node ids (instances stay linked), parts are reused by name.
import { validateContract, variantList, resolveStyle, inherited, layoutFor, diffVariants, splitToken, partKind, statesOf, STEP } from '../../core/contract.js';
import { TOKEN_MAP } from '../../core/token-map.js';
import { TYPE_SCALE } from '../../core/tokens.js';
import { createCtx, loadFonts, textStyle } from './draw.js';
import { icon } from './icons.js';
import { tokenIndex, colorVar, floatVar } from './tokens-resolve.js';

export const PAGE = 'Components';
export const KEY = 'mbank-contract';
const GAP = 24;
const RADIUS_PX = { none: 0, '2xs': 2, xs: 2, sm: 4, md: 8, lg: 12, xl: 16, '2xl': 20, '3xl': 24, '4xl': 32, full: 9999 };
const MAGENTA = { r: 1, g: 0, b: 1 };
const WEIGHT_SUFFIX = { medium: '-md', semibold: '-strong', bold: '-strong' };

export async function componentsPage() {
  await figma.loadAllPagesAsync();
  const page = figma.root.children.find((p) => p.name === PAGE);
  if (page) return page;
  const p = figma.createPage();
  p.name = PAGE;
  return p;
}

export function findSet(page, c) {
  return page.findOne((n) => n.type === 'COMPONENT_SET' && n.getPluginData(KEY) === c.name)
    || page.findOne((n) => n.type === 'COMPONENT_SET' && n.name === (c.title || c.name));
}

async function paintFor(r, value) {
  const { token, opacity } = splitToken(value);
  const v = await colorVar(r.t, token, { create: r.create });
  const base = { type: 'SOLID', color: MAGENTA, opacity };
  if (!v) { r.unbound++; return base; }
  r.bound++;
  return figma.variables.setBoundVariableForPaint(base, 'color', v);
}

async function ringFor(r, value) {
  const { token, opacity } = splitToken(value);
  const v = await colorVar(r.t, token, { create: r.create });
  const effect = { type: 'DROP_SHADOW', color: { ...MAGENTA, a: opacity }, offset: { x: 0, y: 0 }, radius: 0, spread: 3, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false };
  if (!v) { r.unbound++; return effect; }
  r.bound++;
  return figma.variables.setBoundVariableForEffect(effect, 'color', v);
}

function bindFloat(r, node, fields, kind, value) {
  const v = floatVar(r.t, kind, value);
  if (!v) { r.unbound++; return; }
  for (const f of fields) node.setBoundVariable(f, v);
  r.bound++;
}

const FLOAT_FIELDS = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing', 'width', 'height', 'minHeight', 'topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];

async function applyFrame(r, node, s) {
  const L = layoutFor(s);
  for (const f of FLOAT_FIELDS) if (node.boundVariables && node.boundVariables[f]) node.setBoundVariable(f, null); // rebind from scratch
  for (const k of ['layoutMode', 'primaryAxisAlignItems', 'counterAxisAlignItems', 'itemSpacing', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']) node[k] = L[k];
  node.primaryAxisSizingMode = L.primaryAxisSizingMode;
  node.counterAxisSizingMode = L.counterAxisSizingMode;
  if (L.width !== undefined || L.height !== undefined) node.resize(L.width || node.width, L.height || node.height);
  if (L.minHeight !== undefined) node.minHeight = L.minHeight;
  if (s.px !== undefined) bindFloat(r, node, ['paddingLeft', 'paddingRight'], 'space', s.px);
  if (s.py !== undefined) bindFloat(r, node, ['paddingTop', 'paddingBottom'], 'space', s.py);
  if (s.gap !== undefined) bindFloat(r, node, ['itemSpacing'], 'space', s.gap);
  if (s.size !== undefined) bindFloat(r, node, ['width', 'height'], 'space', s.size);
  else if (s.height !== undefined) bindFloat(r, node, ['height'], 'space', s.height);
  if (s['min-height'] !== undefined) bindFloat(r, node, ['minHeight'], 'space', s['min-height']);
  node.fills = s.bg ? [await paintFor(r, s.bg)] : [];
  if (s.border) {
    node.strokes = [await paintFor(r, s.border)];
    node.strokeWeight = s['border-width'] ?? 1;
    node.strokeAlign = 'INSIDE';
  } else node.strokes = [];
  if (s.radius !== undefined) {
    const v = floatVar(r.t, 'radius', s.radius);
    if (v) { for (const f of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) node.setBoundVariable(f, v); r.bound++; }
    else node.cornerRadius = RADIUS_PX[s.radius] ?? 8;
  } else node.cornerRadius = 0;
  node.opacity = s.opacity !== undefined ? s.opacity / 100 : 1;
  node.effects = s['focus-ring'] ? [await ringFor(r, s['focus-ring'])] : [];
}

// Mbank Foundation text style (font/Body/s[-md]) first, then the kit / ds/* styles from draw.js.
async function pickTextStyle(r, size, weight) {
  const key = `${size}/${weight}`;
  if (r.textStyles.has(key)) return r.textStyles.get(key);
  const local = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
  const mapped = TOKEN_MAP.text[size];
  let st = null;
  for (const name of mapped ? [`${mapped}${WEIGHT_SUFFIX[weight] || ''}`, mapped] : []) {
    const hit = local.get(name);
    if (!hit) continue;
    try { await figma.loadFontAsync(hit.fontName); st = hit; break; } catch (e) { /* font not installed */ }
  }
  if (!st) {
    const sz = TYPE_SCALE[size] ? size : { '2xs': 'xs', caption: 'xs', md: 'sm', '5xl': '4xl', '6xl': '4xl', '7xl': '4xl' }[size] || 'sm';
    st = await textStyle(r.ctx, sz, weight);
  }
  r.textStyles.set(key, st);
  return st;
}

const defaultText = (part, c) => ({ placeholder: 'Placeholder', description: 'Описание', value: 'Значение', hint: 'Подсказка' })[part] || c.title || c.name;

async function applyText(r, node, style, part, c) {
  const size = inherited(style, part, 'text', 'sm');
  const weight = inherited(style, part, 'weight', 'regular');
  const st = await pickTextStyle(r, size, weight);
  try { await figma.loadFontAsync(node.fontName); } catch (e) { /* fresh node */ }
  node.fontName = st.fontName;
  if (!node.characters) node.characters = defaultText(part, c);
  await node.setTextStyleIdAsync(st.id);
  node.fills = [await paintFor(r, inherited(style, part, 'fg', 'foreground'))];
  r.bound++; // text style
}

async function applyIcon(r, comp, style, part) {
  const token = splitToken(inherited(style, part, 'fg', 'foreground')).token;
  r.ctx.vars[token] = await colorVar(r.t, token, { create: r.create });
  const node = icon(r.ctx, 'check', token, (style[part]?.size ?? 4) * STEP);
  node.name = part;
  if (r.ctx.vars[token]) r.bound++; else r.unbound++;
  return node;
}

/** Styles one variant component in place; parts are reused by name so overrides survive. */
async function renderVariant(r, comp, c, props, state) {
  const style = resolveStyle(c, props, state);
  await applyFrame(r, comp, style.root);
  const column = comp.layoutMode === 'VERTICAL';
  if (column && comp.counterAxisSizingMode === 'AUTO') { comp.resize(320, comp.height); comp.counterAxisSizingMode = 'FIXED'; } // FILL children need a fixed width
  const keep = new Set();
  for (const part of c.parts.filter((p) => p !== 'root')) {
    const kind = partKind(part);
    let node = comp.children.find((n) => n.name === part);
    if (node && (kind === 'icon' || (kind === 'text') !== (node.type === 'TEXT'))) { node.remove(); node = null; }
    if (kind === 'icon') node = await applyIcon(r, comp, style, part);
    else if (kind === 'text') { node = node || figma.createText(); await applyText(r, node, style, part, c); }
    else { node = node || figma.createFrame(); await applyFrame(r, node, style[part] || {}); }
    node.name = part;
    comp.appendChild(node); // keeps contract order
    if (column && kind !== 'icon') node.layoutSizingHorizontal = 'FILL';
    keep.add(node);
  }
  for (const n of [...comp.children]) if (!keep.has(n)) n.remove();
}

function layoutGrid(set, c, comps) {
  const states = statesOf(c);
  const w = Math.max(...comps.map((x) => x.node.width));
  const h = Math.max(...comps.map((x) => x.node.height));
  comps.forEach((x, i) => {
    x.node.x = GAP + (i % states.length) * (w + GAP);
    x.node.y = GAP + Math.floor(i / states.length) * (h + GAP);
  });
  const rows = Math.ceil(comps.length / states.length);
  set.resizeWithoutConstraints(GAP + states.length * (w + GAP), GAP + rows * (h + GAP));
}

/**
 * opts: { font, create (missing colour tokens -> Brand; default true), prune (remove stale variants) }.
 * Returns the report and the contract with figma.nodeId filled in.
 */
export async function renderContract(c, opts = {}) {
  const errors = validateContract(c);
  if (errors.length) return { errors };
  const page = await componentsPage();
  const t = await tokenIndex();
  const font = await loadFonts(opts.font || 'Inter');
  const r = { t, ctx: createCtx({ vars: {}, radius: {}, font }), textStyles: new Map(), bound: 0, unbound: 0, create: opts.create !== false };
  const wanted = variantList(c);
  let set = findSet(page, c);
  const existing = set ? set.children.filter((n) => n.type === 'COMPONENT').map((n) => ({ id: n.id, name: n.name })) : [];
  const diff = diffVariants(existing, wanted);
  const comps = [];
  for (const w of wanted) {
    const hit = diff.keep.find((k) => k.name === w.name);
    const node = hit ? set.children.find((n) => n.id === hit.id) : figma.createComponent();
    node.name = w.name;
    await renderVariant(r, node, c, w.props, w.state);
    comps.push({ node, w });
  }
  const fresh = comps.filter((x) => !diff.keep.some((k) => k.name === x.w.name)).map((x) => x.node);
  if (!set) {
    set = figma.combineAsVariants(fresh, page);
  } else for (const n of fresh) set.appendChild(n);
  for (const s of diff.stale) if (opts.prune) set.children.find((n) => n.id === s.id)?.remove();
  set.name = c.title || c.name;
  set.description = `mbank/component@1 · ${c.name}`;
  set.setPluginData(KEY, c.name);
  layoutGrid(set, c, comps);
  const contract = { ...c, figma: { ...(c.figma || {}), name: set.name, nodeId: set.id, ...(set.key ? { key: set.key } : {}) } };
  set.setPluginData('contract-json', JSON.stringify(contract));
  return {
    contract,
    report: {
      setId: set.id, page: page.name, variants: wanted.length, created: diff.create.length, updated: diff.keep.length,
      stale: diff.stale.map((s) => s.name), pruned: !!opts.prune, bound: r.bound, unbound: r.unbound,
      missing: t.missing, createdTokens: t.created, fallbackFonts: r.ctx.stats.fallbackFonts,
    },
  };
}
