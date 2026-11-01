// Contract -> component set on the page «Components». One variant per props x states, auto layout
// from the contract, every token property bound to a variable. Re-running updates the set in place:
// variant components keep their node ids (instances stay linked), parts are reused by name.
// contract.anatomy nests parts (parent), fixes widths, fills, stroke sides, sample text and places
// library instances (Badge-status), so a block like «CRM / Application card» is drawn as the designers drew it.
import { validateContract, variantList, resolveStyle, inherited, layoutFor, diffVariants, splitToken, partKind, parentOf, statesOf, STEP } from '../../core/contract.js';
import { TOKEN_MAP } from '../../core/token-map.js';
import { TYPE_SCALE } from '../../core/tokens.js';
import { createCtx, loadFonts, textStyle } from './draw.js';
import { icon } from './icons.js';
import { importByKey } from './library-import.js';
import { tokenIndex, colorVar, floatVar } from './tokens-resolve.js';

export const PAGE = 'Components';
export const KEY = 'mbank-contract';
const GAP = 24;
const RADIUS_PX = { none: 0, '2xs': 2, xs: 2, sm: 4, md: 8, lg: 12, xl: 16, '2xl': 20, '3xl': 24, '4xl': 32, full: 9999 };
const MAGENTA = { r: 1, g: 0, b: 1 };
const WEIGHT_SUFFIX = { medium: '-md', semibold: '-strong', bold: '-strong' };

/** Page for the set: contract.figma.page (e.g. «☰ CRM blocks» in CRM UI KIT), default «Components». */
export async function componentsPage(name = PAGE) {
  await figma.loadAllPagesAsync();
  const page = figma.root.children.find((p) => p.name === name);
  if (page) return page;
  const p = figma.createPage();
  p.name = name;
  return p;
}
export const pageOf = (c) => (c && c.figma && c.figma.page) || PAGE;

// No props and one state: a plain COMPONENT named by the title (CRM / Key-value row), not a set of one.
export const isSingle = (c) => !Object.keys(c.props || {}).length && statesOf(c).length === 1;

const findType = (page, c, type) => page.findOne((n) => n.type === type && n.getPluginData(KEY) === c.name)
  || page.findOne((n) => n.type === type && n.name === (c.title || c.name) && (type === 'COMPONENT_SET' || n.parent === page));

/** The built node: a set, or for a single-variant contract its plain component (a set built before stays a set). */
export function findSet(page, c) {
  const set = findType(page, c, 'COMPONENT_SET');
  return set || (isSingle(c) ? findType(page, c, 'COMPONENT') : null);
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

async function bindFloat(r, node, fields, kind, value) {
  const v = await floatVar(r.t, kind, value);
  if (!v) { r.unbound++; return; }
  for (const f of fields) node.setBoundVariable(f, v);
  r.bound++;
}

const FLOAT_FIELDS = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing', 'width', 'height', 'minHeight', 'topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];

async function applyFrame(r, node, s, a = {}) {
  const L = layoutFor(s);
  if (a.width && s.size === undefined) { // fixed width along the main axis (row) or the cross axis (column); size (square) wins
    L.width = a.width;
    if (L.layoutMode === 'HORIZONTAL') L.primaryAxisSizingMode = 'FIXED'; else L.counterAxisSizingMode = 'FIXED';
  }
  for (const f of FLOAT_FIELDS) if (node.boundVariables && node.boundVariables[f]) node.setBoundVariable(f, null); // rebind from scratch
  for (const k of ['layoutMode', 'primaryAxisAlignItems', 'counterAxisAlignItems', 'itemSpacing', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']) node[k] = L[k];
  node.primaryAxisSizingMode = L.primaryAxisSizingMode;
  node.counterAxisSizingMode = L.counterAxisSizingMode;
  if (L.width !== undefined || L.height !== undefined) {
    node.resize(L.width || node.width, L.height || node.height);
    node.primaryAxisSizingMode = L.primaryAxisSizingMode; // resize() fixed both axes
    node.counterAxisSizingMode = L.counterAxisSizingMode;
  }
  if (L.minHeight !== undefined) node.minHeight = L.minHeight;
  if (s.px !== undefined) await bindFloat(r, node, ['paddingLeft', 'paddingRight'], 'space', s.px);
  if (s.py !== undefined) await bindFloat(r, node, ['paddingTop', 'paddingBottom'], 'space', s.py);
  if (s.pt !== undefined) await bindFloat(r, node, ['paddingTop'], 'space', s.pt);
  if (s.pb !== undefined) await bindFloat(r, node, ['paddingBottom'], 'space', s.pb);
  if (s.gap !== undefined) await bindFloat(r, node, ['itemSpacing'], 'space', s.gap);
  if (s.size !== undefined) await bindFloat(r, node, ['width', 'height'], 'space', s.size);
  else if (s.height !== undefined) await bindFloat(r, node, ['height'], 'space', s.height);
  if (s['min-height'] !== undefined) await bindFloat(r, node, ['minHeight'], 'space', s['min-height']);
  node.fills = s.bg ? [await paintFor(r, s.bg)] : [];
  if (s.border) {
    node.strokes = [await paintFor(r, s.border)];
    const w = s['border-width'] ?? 1;
    node.strokeWeight = w;
    node.strokeAlign = 'INSIDE';
    if (a.sides) for (const side of ['Top', 'Right', 'Bottom', 'Left']) node[`stroke${side}Weight`] = a.sides.includes(side.toLowerCase()) ? w : 0;
  } else node.strokes = [];
  if (s.radius !== undefined) {
    const v = await floatVar(r.t, 'radius', s.radius);
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
    const hit = local.get(name) || (await libraryStyle(name));
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

// Web components text style through its baked key (CRM UI KIT uses it as a library).
async function libraryStyle(name) {
  const key = TOKEN_MAP.styleKeys && TOKEN_MAP.styleKeys[name];
  if (!key || !figma.importStyleByKeyAsync) return null;
  return importByKey(() => figma.importStyleByKeyAsync(key));
}

const LABELS = { button: 'Кнопка', badge: 'Статус', pagination: '1', 'tabs-trigger': 'Вкладка', avatar: 'АТ' };
const defaultText = (part, c) => ({ placeholder: 'Placeholder', description: 'Описание', value: 'Значение', hint: 'Подсказка' })[part] || LABELS[c.name] || c.title || c.name;

async function applyText(r, node, style, part, c, a = {}) {
  const size = inherited(style, part, 'text', 'sm');
  const weight = inherited(style, part, 'weight', 'regular');
  const st = await pickTextStyle(r, size, weight);
  try { await figma.loadFontAsync(node.fontName); } catch (e) { /* fresh node */ }
  node.fontName = st.fontName;
  if (!node.characters) node.characters = a.sample || defaultText(part, c);
  await node.setTextStyleIdAsync(st.id);
  node.fills = [await paintFor(r, inherited(style, part, 'fg', 'foreground'))];
  r.bound++; // text style
}

async function applyIcon(r, comp, style, part, a = {}) {
  const token = splitToken(inherited(style, part, 'fg', 'foreground')).token;
  r.ctx.vars[token] = await colorVar(r.t, token, { create: r.create });
  const node = icon(r.ctx, a.icon || 'check', token, (style[part]?.size ?? 4) * STEP);
  node.name = part;
  if (r.ctx.vars[token]) r.bound++; else r.unbound++;
  return node;
}

// Library component (Badge-status) by key, else a local set/component with that name; null = not found.
async function instanceOf(r, a) {
  const { name, key } = a.component;
  let main = null;
  if (key && figma.importComponentByKeyAsync) main = await importByKey(() => figma.importComponentByKeyAsync(key));
  if (!main) {
    const local = figma.root.findOne((n) => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.name === name);
    main = local && local.type === 'COMPONENT_SET' ? local.defaultVariant : local;
  }
  if (!main) { if (!r.missingComponents.includes(name)) r.missingComponents.push(name); return null; }
  const inst = main.createInstance();
  const label = a.sample && inst.findOne && inst.findOne((n) => n.type === 'TEXT');
  if (label) { try { await figma.loadFontAsync(label.fontName); label.characters = a.sample; } catch (e) { /* keep the library text */ } }
  r.instances++;
  return inst;
}

async function renderPart(r, holder, style, part, c) {
  const kind = partKind(part, c);
  const a = (c.anatomy && c.anatomy[part]) || {};
  const layer = a.layer || part;
  let node = holder.children.find((n) => n.name === layer);
  const fits = node && (kind === 'text' ? node.type === 'TEXT' : kind === 'instance' ? node.type === 'INSTANCE' : kind === 'frame' && node.type === 'FRAME');
  if (node && !fits) { node.remove(); node = null; }
  if (kind === 'icon') node = await applyIcon(r, holder, style, part, a);
  else if (kind === 'instance') node = node || (await instanceOf(r, a)) || figma.createFrame();
  else if (kind === 'text') { node = node || figma.createText(); await applyText(r, node, style, part, c, a); }
  else { node = node || figma.createFrame(); await applyFrame(r, node, style[part] || {}, a); }
  node.name = layer;
  holder.appendChild(node); // keeps contract order
  const column = holder.layoutMode === 'VERTICAL';
  const fill = c.anatomy ? !!a.fill : column && kind !== 'icon';
  if (fill) node.layoutSizingHorizontal = 'FILL';
  if (fill && kind === 'text') node.textAutoResize = 'HEIGHT'; // long copy wraps inside the part
  // a filling frame in a fixed-size row (avatar fallback) fills it both ways, so the circle is the frame
  // and a fixed-width frame in a fixed-height row (progress indicator) takes the row's height
  if (kind === 'frame' && !column && holder.counterAxisSizingMode === 'FIXED' && ((fill && holder.primaryAxisSizingMode === 'FIXED') || a.width)) node.layoutSizingVertical = 'FILL';
  else if (kind === 'text' && a.width) { node.textAutoResize = 'HEIGHT'; node.resize(a.width, node.height); }
  return node;
}

/** Styles one variant component in place; parts are reused by name (inside their parent) so overrides survive. */
async function renderVariant(r, comp, c, props, state) {
  const style = resolveStyle(c, props, state);
  const rootA = (c.anatomy && c.anatomy.root) || {};
  await applyFrame(r, comp, style.root, rootA);
  if (comp.layoutMode === 'VERTICAL' && comp.counterAxisSizingMode === 'AUTO') { comp.resize(320, comp.height); comp.counterAxisSizingMode = 'FIXED'; } // FILL children need a fixed width
  const holders = new Map([['root', comp]]);
  const keep = new Set();
  for (const part of c.parts.filter((p) => p !== 'root')) {
    const node = await renderPart(r, holders.get(parentOf(c, part)), style, part, c);
    node.visible = !(style[part] && style[part].hidden); // e.g. label off on icon-only buttons
    holders.set(part, node);
    keep.add(node);
  }
  // drop leftovers inside part frames — not inside icons (their vectors are the icon) or instances
  for (const [part, h] of holders) if (h.type !== 'INSTANCE' && h.children && partKind(part, c) !== 'icon') for (const n of [...h.children]) if (!keep.has(n)) n.remove();
  // an empty hug frame keeps Figma's default 100 px: collapse it unless the contract sizes it
  for (const [part, h] of holders) {
    const s = style[part] || {};
    if (part !== 'root' && h.type === 'FRAME' && !h.children.length && h.layoutSizingVertical !== 'FILL' && s.height === undefined && s.size === undefined && s['min-height'] === undefined) h.resize(h.width, 0.01);
  }
}

// Variants in a grid: states as columns; a set without states uses its last property as columns
// (Badge: size; Progress: tone), so nothing ends up as one long column.
function layoutGrid(set, c, comps) {
  const states = statesOf(c);
  const props = Object.keys(c.props || {});
  const cols = states.length > 1 ? states.length : props.length ? (c.props[props[props.length - 1]].values || []).length || 1 : 1;
  const w = Math.max(...comps.map((x) => x.node.width));
  const h = Math.max(...comps.map((x) => x.node.height));
  comps.forEach((x, i) => {
    x.node.x = GAP + (i % cols) * (w + GAP);
    x.node.y = GAP + Math.floor(i / cols) * (h + GAP);
  });
  const rows = Math.ceil(comps.length / cols);
  set.resizeWithoutConstraints(GAP + cols * (w + GAP), GAP + rows * (h + GAP));
}

const reportOf = (r, t, extra) => ({
  ...extra, bound: r.bound, unbound: r.unbound, missing: t.missing, createdTokens: t.created, fallbackFonts: r.ctx.stats.fallbackFonts,
  imported: t.imported, instances: r.instances, missingComponents: r.missingComponents,
});

// Figma keeps the placeholder colour of a bound paint when it replaces an existing paint on the same node
// (seen in Figma Desktop: variants stayed magenta though bound to valid variables). Clearing the list and
// assigning the bound paints again makes Figma resolve them.
// The label part becomes the set's «Label» text property, so screens (and designers) set the text on instances.
function textProperty(set, c) {
  const part = ['label', 'text'].find((p) => c.parts.includes(p));
  if (!part || set.type !== 'COMPONENT_SET') return;
  const defs = set.componentPropertyDefinitions;
  let key = Object.keys(defs).find((k) => defs[k].type === 'TEXT' && /^Label#/.test(k));
  if (!key) key = set.addComponentProperty('Label', 'TEXT', defaultText(part, c));
  for (const v of set.children) {
    const t = v.findOne((n) => n.type === 'TEXT' && n.name === part);
    if (t) t.componentPropertyReferences = { characters: key };
  }
}

async function refreshPaints(root) {
  const nodes = [root, ...(root.findAll ? root.findAll(() => true) : [])];
  for (const n of nodes) {
    for (const key of ['fills', 'strokes']) {
      const list = n[key];
      if (!Array.isArray(list) || !list.some((p) => p.boundVariables && p.boundVariables.color)) continue;
      const next = [];
      for (const p of list) {
        const id = p.boundVariables && p.boundVariables.color && p.boundVariables.color.id;
        const v = id && (await figma.variables.getVariableByIdAsync(id));
        next.push(v ? figma.variables.setBoundVariableForPaint(p, 'color', v) : p);
      }
      n[key] = [];
      n[key] = next;
    }
  }
}

function finish(node, c) {
  node.name = c.title || c.name;
  node.description = `mbank/component@1 · ${c.name}`;
  node.setPluginData(KEY, c.name);
  const contract = { ...c, figma: { ...(c.figma || {}), name: node.name, nodeId: node.id, ...(node.key ? { key: node.key } : {}) } };
  node.setPluginData('contract-json', JSON.stringify(contract));
  return contract;
}

async function renderSingle(r, t, page, found, c) {
  const node = found || figma.createComponent();
  if (!found) { page.appendChild(node); node.x = GAP; node.y = GAP + Math.max(0, ...page.children.filter((n) => n !== node).map((n) => n.y + n.height)); }
  await renderVariant(r, node, c, {}, 'default');
  await refreshPaints(node);
  const contract = finish(node, c);
  return { contract, report: reportOf(r, t, { setId: node.id, page: page.name, variants: 1, created: found ? 0 : 1, updated: found ? 1 : 0, stale: [], pruned: false }) };
}

/**
 * opts: { font, create (missing colour tokens -> Brand; default true), prune (remove stale variants) }.
 * Returns the report and the contract with figma.nodeId filled in.
 */
export async function renderContract(c, opts = {}) {
  const errors = validateContract(c);
  if (errors.length) return { errors };
  const page = await componentsPage(pageOf(c));
  const t = await tokenIndex();
  const font = await loadFonts(opts.font || 'Inter');
  const r = { t, ctx: createCtx({ vars: {}, radius: {}, font }), textStyles: new Map(), bound: 0, unbound: 0, instances: 0, missingComponents: [], create: opts.create !== false };
  const wanted = variantList(c);
  let set = findSet(page, c);
  if (isSingle(c) && (!set || set.type === 'COMPONENT')) return renderSingle(r, t, page, set, c);
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
  layoutGrid(set, c, comps);
  textProperty(set, c);
  await refreshPaints(set);
  const contract = finish(set, c);
  return {
    contract,
    report: reportOf(r, t, {
      setId: set.id, page: page.name, variants: wanted.length, created: diff.create.length, updated: diff.keep.length,
      stale: diff.stale.map((s) => s.name), pruned: !!opts.prune,
    }),
  };
}
