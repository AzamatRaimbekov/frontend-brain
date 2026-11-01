// Sandbox side of the «Компоненты» tab: a component contract -> its component in this file.
// Update re-renders the component IN PLACE through DS Builder's renderContract (variant nodes keep
// their ids, so every instance in the file follows), build creates it on its page, insert drops an
// instance next to the widget, usage counts the instances a change reaches. Event handlers only.
import { renderContract, findSet, pageOf, isSingle } from '../../builder/plugin/src/components.js';
import { importByKey } from '../../builder/plugin/src/library-import.js';
import { variantList, resolveStyle, inherited, splitToken, parentOf, partKind, tokensUsed } from '../../builder/core/contract.js';
import { THEME } from '../core/model.js';

const INSERTED = 'mbank-insert';
const RADII = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];

async function mainOf(inst) {
  try { return inst.getMainComponentAsync ? await inst.getMainComponentAsync() : inst.mainComponent || null; } catch (e) { return null; }
}
const ownerOf = (main) => (main && main.parent && main.parent.type === 'COMPONENT_SET' ? main.parent : main);
function pageNode(node) {
  let p = node;
  while (p && p.type !== 'PAGE') p = p.parent;
  return p || null;
}
const pageName = (node) => (pageNode(node) ? pageNode(node).name : '?');
function inside(node, id) {
  for (let p = node.parent; p; p = p.parent) if (p.id === id) return true;
  return false;
}

/** The local component built from the contract: its page first, then any page (a designer may have moved it). */
export async function findLocal(c) {
  await figma.loadAllPagesAsync();
  const pages = figma.root.children;
  const home = pages.find((p) => p.name === pageOf(c));
  const order = home ? [home, ...pages.filter((p) => p !== home)] : pages;
  for (const p of order) {
    const hit = findSet(p, c);
    if (hit) return hit;
  }
  return null;
}

/**
 * Instances in the whole file for each target { name, id?, key? }: id = local set or component,
 * key = library component (remote main). -> { [name]: { instances, pages: { <page>: n } } }
 */
export async function instanceUsage(targets) {
  const out = {};
  for (const t of targets) out[t.name] = { instances: 0, pages: {} };
  if (!targets.length) return out;
  await figma.loadAllPagesAsync();
  for (const inst of figma.root.findAllWithCriteria({ types: ['INSTANCE'] })) {
    const main = await mainOf(inst);
    const owner = ownerOf(main);
    if (!owner) continue;
    const t = targets.find((x) => (x.id && owner.id === x.id) || (x.key && owner.remote && (owner.key === x.key || main.key === x.key)));
    if (!t || (t.id && inside(inst, t.id))) continue; // an instance inside the set itself is not a placement
    const u = out[t.name];
    u.instances++;
    u.pages[pageName(inst)] = (u.pages[pageName(inst)] || 0) + 1;
  }
  return out;
}

const libraryKey = (c) => (c.figma && c.figma.key) || null;

/** state: local (built in this file) | library (only library instances here) | none. */
export async function componentStatus(c) {
  const node = await findLocal(c);
  const key = libraryKey(c);
  const target = node ? { name: c.name, id: node.id } : key ? { name: c.name, key } : null;
  const use = target ? (await instanceUsage([target]))[c.name] : { instances: 0, pages: {} };
  return {
    name: c.name, title: c.title || c.name, state: node ? 'local' : use.instances ? 'library' : 'none',
    setId: node ? node.id : null, variants: node ? (node.type === 'COMPONENT_SET' ? node.children.length : 1) : 0,
    instances: use.instances, pages: use.pages,
  };
}

// DS Builder resolves Mbank token names (2.theme map, Mode, library keys), not project tokens:
// "mb-promo" lives in 2.theme as custom/mb/promo. After the render the widget binds those itself.
async function extraVariables(extras) {
  const out = new Map();
  if (!extras.length) return out;
  const theme = (await figma.variables.getLocalVariableCollectionsAsync()).find((x) => x.name.trim() === THEME);
  if (!theme) return out;
  const vars = (await figma.variables.getLocalVariablesAsync()).filter((v) => v.variableCollectionId === theme.id);
  for (const x of extras) {
    const v = vars.find((y) => y.name === x.figma);
    if (v) out.set(x.css, v);
  }
  return out;
}

const boundPaint = (v, opacity) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity }, 'color', v);

function partNode(nodes, c, part) {
  const holder = nodes.get(parentOf(c, part));
  const layer = (c.anatomy && c.anatomy[part] && c.anatomy[part].layer) || part;
  return holder && holder.type !== 'INSTANCE' && holder.children ? holder.children.find((n) => n.name === layer) || null : null;
}

/** Binds project tokens on every variant the way renderVariant binds Mbank tokens. Returns bindings made. */
function bindExtras(node, c, vars) {
  let bound = 0;
  const colour = (value) => {
    if (!value) return null;
    const { token, opacity } = splitToken(value);
    const v = vars.get(token);
    return v && v.resolvedType === 'COLOR' ? boundPaint(v, opacity) : null;
  };
  const list = variantList(c);
  const comps = node.type === 'COMPONENT_SET' ? node.children.filter((n) => n.type === 'COMPONENT') : [node];
  for (const comp of comps) {
    const w = isSingle(c) ? list[0] : list.find((x) => x.name === comp.name);
    if (!w) continue;
    const style = resolveStyle(c, w.props, w.state);
    const nodes = new Map([['root', comp]]);
    for (const part of c.parts) {
      const el = part === 'root' ? comp : partNode(nodes, c, part);
      if (!el) continue;
      nodes.set(part, el);
      const kind = partKind(part, c);
      if (kind === 'instance') continue;
      if (kind === 'text' || kind === 'icon') {
        const paint = colour(inherited(style, part, 'fg', 'foreground'));
        if (!paint) continue;
        if (kind === 'text') el.fills = [paint];
        else for (const vec of el.findAll((n) => n.type === 'VECTOR')) { if (vec.strokes.length) vec.strokes = [paint]; if (vec.fills.length) vec.fills = [paint]; }
        bound++;
        continue;
      }
      const s = style[part] || {};
      const bg = colour(s.bg);
      if (bg) { el.fills = [bg]; bound++; }
      const border = colour(s.border);
      if (border) { el.strokes = [border]; bound++; }
      const ring = s['focus-ring'] && vars.get(splitToken(s['focus-ring']).token);
      if (ring && el.effects && el.effects.length) { el.effects = [figma.variables.setBoundVariableForEffect({ ...el.effects[0] }, 'color', ring)]; bound++; }
      const radius = s.radius !== undefined && vars.get(String(s.radius));
      if (radius && radius.resolvedType === 'FLOAT') { for (const f of RADII) el.setBoundVariable(f, radius); bound++; }
    }
  }
  return bound;
}

/**
 * Re-renders the local component of contract c in place (build: create it when missing).
 * extras: project tokens of the board [{ css, figma, kind }]. Variant nodes are never deleted.
 */
export async function updateComponent(c, extras = [], { build = false } = {}) {
  const before = await findLocal(c);
  if (!before) {
    const st = await componentStatus(c);
    if (st.state === 'library') throw new Error(`«${st.title}» в этом файле из библиотеки (${st.instances} экз.): меняйте компонент в файле библиотеки и публикуйте, здесь — Accept updates`);
    if (!build) return { needsBuild: true, name: c.name, title: c.title || c.name };
  }
  const ids = before ? (before.type === 'COMPONENT_SET' ? before.children.map((n) => n.id) : [before.id]) : [];
  const res = await renderContract(c, { create: false, prune: false });
  if (res.errors) throw new Error(`Контракт с ошибками: ${res.errors.join('; ')}`);
  const node = await figma.getNodeByIdAsync(res.report.setId);
  const used = tokensUsed(c);
  const mine = extras.filter((x) => used.color.has(x.css) || used.radius.has(x.css));
  const vars = await extraVariables(mine);
  const extraBound = vars.size ? bindExtras(node, c, vars) : 0;
  const nowIds = node.type === 'COMPONENT_SET' ? node.children.map((n) => n.id) : [node.id];
  const use = (await instanceUsage([{ name: c.name, id: node.id }]))[c.name];
  return {
    name: c.name, title: c.title || c.name, setId: node.id, page: res.report.page, built: !before,
    variants: nowIds.length, kept: ids.filter((id) => nowIds.includes(id)).length, created: res.report.created,
    bound: res.report.bound + extraBound, extraBound,
    missing: res.report.missing.filter((m) => !vars.has(m.token)).map((m) => `${m.kind}: ${m.token}`),
    notApplied: mine.filter((x) => !vars.has(x.css)).map((x) => x.css),
    instances: use.instances, pages: use.pages,
  };
}

/** Instance of the contract's component next to the widget (local first, else the library by key). */
export async function insertInstance(c, widgetId) {
  const local = await findLocal(c);
  let main = local ? (local.type === 'COMPONENT_SET' ? local.defaultVariant || local.children[0] : local) : null;
  const key = libraryKey(c);
  if (!main && key && figma.importComponentByKeyAsync) {
    main = await importByKey(() => figma.importComponentByKeyAsync(key));
    if (!main) { const set = await importByKey(() => figma.importComponentSetByKeyAsync(key)); main = set ? set.defaultVariant : null; }
  }
  if (!main) throw new Error(`«${c.title || c.name}» нет в файле и в подключённых библиотеках: сначала «Собрать компонент»`);
  const inst = main.createInstance();
  const anchor = widgetId ? await figma.getNodeByIdAsync(widgetId) : null;
  const parent = (anchor && anchor.parent) || figma.currentPage;
  parent.appendChild(inst);
  const x = anchor ? anchor.x + anchor.width + 48 : 0;
  const column = parent.children.filter((n) => n !== inst && n.x === x && n.getPluginData && n.getPluginData(INSERTED));
  inst.x = x;
  inst.y = column.length ? Math.max(...column.map((n) => n.y + n.height)) + 24 : anchor ? anchor.y : 0;
  inst.setPluginData(INSERTED, c.name);
  if (pageNode(inst) === figma.currentPage) {
    figma.currentPage.selection = [inst];
    figma.viewport.scrollAndZoomIntoView([inst]);
  }
  return { id: inst.id, name: main.name, title: c.title || c.name, source: local ? 'local' : 'library', x: inst.x, y: inst.y };
}

/**
 * Where a variable change reached: contracts that use the changed tokens (css names), their
 * components in this file (local or library) and the instances that follow them.
 */
export async function propagation(contracts, changedCss, variables) {
  const touches = (c) => {
    const u = tokensUsed(c);
    return [...changedCss].some((css) => u.color.has(css) || u.radius.has(css) || u.radius.has(css.replace(/^radius-/, '')));
  };
  const found = [];
  for (const c of contracts.filter(touches)) found.push({ c, node: await findLocal(c), key: libraryKey(c) });
  const targets = found.filter((x) => x.node || x.key).map((x) => ({ name: x.c.name, id: x.node ? x.node.id : null, key: x.node ? null : x.key }));
  const use = await instanceUsage(targets);
  const components = found.map((x) => {
    const u = use[x.c.name] || { instances: 0, pages: {} };
    return { name: x.c.name, title: x.c.title || x.c.name, inFile: !!x.node, library: !x.node && u.instances > 0, instances: u.instances, pages: u.pages };
  });
  return {
    kind: 'apply', variables, components, setsUpdated: 0,
    instances: components.reduce((n, x) => n + x.instances, 0),
  };
}
