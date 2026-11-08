// Minimal in-memory Figma Plugin API. Mirrors the rules that break real plugins:
// FILL/HUG sizing context, unloaded fonts, alias targets, readonly paints.
let seq = 0;
const nid = (p) => `${p}:${++seq}`;

// library: { variables: [{ key, name, type }], styles: [{ key, name, fontName }], components: [{ key, name }] } —
// what importVariableByKeyAsync / importStyleByKeyAsync / importComponentByKeyAsync can reach (a file that
// uses Foundation and Web components as libraries, like CRM UI KIT). Unknown keys throw, like Figma.
export function createFigma({ missingFonts = ['Inter Mbank'], library = null } = {}) {
  const loaded = new Set();
  const vars = new Map();
  const cols = new Map();
  const nodes = new Map();
  const textStyles = [];

  class Variable {
    constructor(name, col, type) {
      Object.assign(this, { id: nid('VariableID'), name, resolvedType: type, variableCollectionId: col.id, valuesByMode: {}, scopes: ['ALL_SCOPES'], codeSyntax: {}, pd: {} });
      vars.set(this.id, this);
      col.variableIds.push(this.id);
    }
    setValueForMode(modeId, value) {
      const col = cols.get(this.variableCollectionId);
      if (!col.modes.some((m) => m.modeId === modeId)) throw new Error(`mode ${modeId} not in ${col.name}`);
      if (value && value.type === 'VARIABLE_ALIAS' && !vars.has(value.id)) throw new Error('alias to missing variable');
      if (value && value.type === 'VARIABLE_ALIAS' && value.id === this.id) throw new Error('self alias');
      this.valuesByMode[modeId] = value;
    }
    setVariableCodeSyntax(p, v) { this.codeSyntax[p] = v; }
    setPluginData(k, v) { this.pd[k] = v; }
    getPluginData(k) { return this.pd[k] || ''; }
    remove() { vars.delete(this.id); const c = cols.get(this.variableCollectionId); if (c) c.variableIds = c.variableIds.filter((x) => x !== this.id); }
  }

  class Collection {
    constructor(name) {
      const m = nid('mode');
      Object.assign(this, { id: nid('VariableCollectionId'), name, modes: [{ modeId: m, name: 'Mode 1' }], defaultModeId: m, variableIds: [] });
      cols.set(this.id, this);
    }
    renameMode(id, name) { this.modes.find((m) => m.modeId === id).name = name; }
    addMode(name) {
      const id = nid('mode');
      this.modes.push({ modeId: id, name });
      for (const v of this.variableIds.map((x) => vars.get(x))) v.valuesByMode[id] = v.valuesByMode[this.defaultModeId];
      return id;
    }
    removeMode(id) { this.modes = this.modes.filter((m) => m.modeId !== id); }
    remove() { for (const id of [...this.variableIds]) vars.get(id)?.remove(); cols.delete(this.id); }
  }

  const BINDABLE = ['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'itemSpacing', 'counterAxisSpacing', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
    'topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius', 'strokeWeight', 'opacity', 'visible', 'characters'];

  const SIZING_OK = (node, v) => {
    const parentAL = node.parent && node.parent.layoutMode && node.parent.layoutMode !== 'NONE';
    if (v === 'FILL' && !parentAL) throw new Error(`FILL can only be set on children of auto-layout frames (${node.name})`);
    if (v === 'HUG' && !(node.layoutMode && node.layoutMode !== 'NONE') && !(node.type === 'TEXT' && parentAL)) throw new Error(`HUG not allowed on ${node.type} ${node.name}`);
  };

  class Node {
    constructor(type) {
      Object.assign(this, { id: nid('node'), type, name: type, parent: null, children: [], width: 100, height: 100, x: 0, y: 0, visible: true, boundVariables: {}, explicitModes: {} });
      this._fills = [];
      this._strokes = [];
      this._lsh = 'FIXED';
      this._lsv = 'FIXED';
      nodes.set(this.id, this);
    }
    get fills() { return Object.freeze([...this._fills]); }
    set fills(v) { this._fills = v.map((p) => Object.freeze({ ...p })); }
    get strokes() { return Object.freeze([...this._strokes]); }
    set strokes(v) { this._strokes = v.map((p) => Object.freeze({ ...p })); }
    get layoutSizingHorizontal() { return this._lsh; }
    set layoutSizingHorizontal(v) { SIZING_OK(this, v); this._lsh = v; }
    get layoutSizingVertical() { return this._lsv; }
    set layoutSizingVertical(v) { SIZING_OK(this, v); this._lsv = v; }
    appendChild(c) { if (insideInstance(this)) throw new Error(`cannot append into an instance (${this.name})`); if (c.parent) c.parent.children = c.parent.children.filter((x) => x !== c); c.parent = this; this.children.push(c); this._grow(c); }
    insertChild(i, c) { if (c.parent) c.parent.children = c.parent.children.filter((x) => x !== c); c.parent = this; this.children.splice(i, 0, c); this._grow(c); }
    _grow(c) { if (this.layoutMode === 'VERTICAL') this.height = (this.height || 0) + c.height; }
    // like Figma: resizing an auto-layout frame fixes both axes
    resize(w, h) { if (!(w > 0 && h > 0)) throw new Error(`bad size ${w}x${h} on ${this.name}`); this.width = w; this.height = h; if (this.layoutMode && this.layoutMode !== 'NONE') { this.primaryAxisSizingMode = 'FIXED'; this.counterAxisSizingMode = 'FIXED'; } }
    resizeWithoutConstraints(w, h) { this.resize(w, h); }
    rescale(s) { this.width *= s; this.height *= s; }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter((x) => x !== this); nodes.delete(this.id); this.removed = true; }
    setBoundVariable(field, v) {
      if (v === null) { delete this.boundVariables[field]; return; }
      if (!vars.has(v.id)) throw new Error('bind missing var');
      if (!BINDABLE.includes(field)) throw new Error(`field ${field} is not bindable`);
      this.boundVariables[field] = { type: 'VARIABLE_ALIAS', id: v.id };
    }
    setExplicitVariableModeForCollection(c, modeId) { if (!c.modes.some((m) => m.modeId === modeId)) throw new Error('bad mode'); this.explicitModes[c.id] = modeId; }
    findAll(fn) { const out = []; const walk = (n) => n.children.forEach((c) => { if (fn(c)) out.push(c); walk(c); }); walk(this); return out; }
    findOne(fn) { return this.findAll(fn)[0] || null; }
    findAllWithCriteria({ types }) { return this.findAll((n) => types.includes(n.type)); }
    setPluginData(k, v) { this.pd = this.pd || {}; if (v === '') delete this.pd[k]; else this.pd[k] = String(v); }
    getPluginData(k) { return (this.pd && this.pd[k]) || ''; }
    getPluginDataKeys() { return Object.keys(this.pd || {}); }
    // sharedPluginData: one namespace visible to every plugin and widget (DS Builder <-> Mbank Tokens)
    setSharedPluginData(ns, k, v) { this.spd = this.spd || {}; const m = (this.spd[ns] = this.spd[ns] || {}); if (v === '') delete m[k]; else m[k] = String(v); }
    getSharedPluginData(ns, k) { return (this.spd && this.spd[ns] && this.spd[ns][k]) || ''; }
    getSharedPluginDataKeys(ns) { return Object.keys((this.spd && this.spd[ns]) || {}); }
    // Prototype: NAVIGATE only to a live top-level frame (or a frame in a section) on the same page,
    // never from a node inside an instance — the rules Figma enforces.
    get reactions() { return this._reactions || []; }
    set reactions(list) {
      const page = (n) => { for (let p = n; p; p = p.parent) { if (p.removed) return null; if (p.type === 'PAGE') return p; } return null; };
      for (let p = this.parent; p; p = p.parent) if (p.type === 'INSTANCE') throw new Error(`reactions inside an instance (${this.name})`);
      for (const r of list) for (const a of r.actions || []) {
        const dest = nodes.get(a.destinationId);
        if (!dest || dest.type !== 'FRAME' || !['PAGE', 'SECTION'].includes(dest.parent?.type)) throw new Error(`bad destination ${a.destinationId}`);
        if (page(dest) !== page(this)) throw new Error('destination on another page');
      }
      this._reactions = list.map((r) => JSON.parse(JSON.stringify(r)));
    }
    async setReactionsAsync(list) { this.reactions = list; }
  }

  // Copies a component's layers into an instance (fresh ids, same names, auto layout and text).
  const SKIP = new Set(['id', 'type', 'parent', 'children', 'pd', 'spd', '_reactions', 'key', 'description', 'removed', 'mainComponent', 'textProps']);
  function cloneInto(src, dst) {
    for (const [k, v] of Object.entries(src)) if (!SKIP.has(k)) dst[k] = Array.isArray(v) ? [...v] : v && typeof v === 'object' && k !== '_font' ? { ...v } : v;
    for (const c of src.children) {
      let n;
      if (c.type === 'INSTANCE' && c.mainComponent) n = new Instance(c.mainComponent, c);
      else { n = c.type === 'TEXT' ? new Text() : new Node(c.type); cloneInto(c, n); }
      n.parent = dst;
      dst.children.push(n);
    }
    return dst;
  }
  const insideInstance = (n) => { for (let p = n; p; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };
  const variantName = (props) => Object.entries(props).map(([k, v]) => `${k}=${v}`).join(', ');
  const parseVariant = (name) => Object.fromEntries(name.split(',').map((p) => p.split('=').map((x) => x.trim())));

  // Instance: a live copy of its main component. setProperties switches variants and sets TEXT properties
  // (the referenced text needs its font loaded, like Figma); nothing can be appended inside it.
  class Instance extends Node {
    constructor(main, from = null) { super('INSTANCE'); this.mainComponent = main; this.textValues = {}; cloneInto(from || main, this); this.textValues = { ...this.textValues }; }
    async getMainComponentAsync() { return this.mainComponent; }
    get componentProperties() {
      const main = this.mainComponent;
      const set = main.parent && main.parent.type === 'COMPONENT_SET' ? main.parent : null;
      const out = {};
      if (set) for (const [k, v] of Object.entries(parseVariant(main.name))) out[k] = { type: 'VARIANT', value: v };
      for (const [k, d] of Object.entries((set || main).textProps || {})) out[k] = { type: d.type, value: this.textValues[k] ?? d.defaultValue };
      return out;
    }
    setProperties(props) {
      const defs = this.componentProperties;
      const variant = {};
      for (const [k, v] of Object.entries(props)) {
        if (!defs[k]) throw new Error(`Could not find a component property with name: '${k}'`);
        if (defs[k].type === 'VARIANT') variant[k] = v;
      }
      if (Object.keys(variant).length) {
        const set = this.mainComponent.parent;
        const want = variantName({ ...parseVariant(this.mainComponent.name), ...variant });
        const next = set.children.find((c) => c.name === want);
        if (!next) throw new Error(`no variant ${want}`);
        const texts = new Map(this.findAll((n) => n.type === 'TEXT').map((t) => [t.name, t.characters]));
        this.children.forEach((c) => nodes.delete(c.id));
        this.children = [];
        this.mainComponent = next;
        const { width, height } = this;
        cloneInto(next, this);
        Object.assign(this, { width, height });
        for (const t of this.findAll((n) => n.type === 'TEXT')) if (texts.has(t.name)) t._chars = texts.get(t.name);
      }
      for (const [k, v] of Object.entries(props)) {
        if (defs[k].type !== 'TEXT') continue;
        for (const t of this.findAll((n) => n.type === 'TEXT' && n.componentPropertyReferences && n.componentPropertyReferences.characters === k)) t.characters = v;
        this.textValues[k] = v;
      }
    }
  }

  // Components: a set's children are COMPONENT variants named 'prop=value, ...'.
  class Component extends Node {
    constructor() { super('COMPONENT'); this.layoutMode = 'NONE'; this.description = ''; this.key = `key-${this.id}`; }
    createInstance() { return new Instance(this); }
  }
  class ComponentSet extends Node {
    constructor() { super('COMPONENT_SET'); this.description = ''; this.key = `key-${this.id}`; this.layoutMode = 'NONE'; }
    get defaultVariant() { return this.children[0]; }
    get componentPropertyDefinitions() {
      const defs = {};
      for (const c of this.children) for (const pair of c.name.split(',')) {
        const [k, v] = pair.split('=').map((x) => x.trim());
        if (!k || v === undefined) throw new Error(`variant name without prop=value: ${c.name}`);
        const d = (defs[k] = defs[k] || { type: 'VARIANT', defaultValue: v, variantOptions: [] });
        if (!d.variantOptions.includes(v)) d.variantOptions.push(v);
      }
      return { ...defs, ...(this.textProps || {}) };
    }
    addComponentProperty(name, type, defaultValue) {
      const key = `${name}#${Object.keys(this.textProps || {}).length + 1}:0`;
      this.textProps = { ...(this.textProps || {}), [key]: { type, defaultValue } };
      return key;
    }
    appendChild(c) { if (c.type !== 'COMPONENT') throw new Error('component set takes components only'); super.appendChild(c); }
  }

  class Text extends Node {
    constructor() { super('TEXT'); this._chars = ''; this._font = { family: 'Inter', style: 'Regular' }; this.textStyleId = ''; this.height = 20; }
    get fontName() { return this._font; }
    set fontName(f) { if (!loaded.has(`${f.family}|${f.style}`)) throw new Error(`Cannot write to node with unloaded font "${f.family} ${f.style}"`); this._font = f; }
    get characters() { return this._chars; }
    set characters(s) { if (!loaded.has(`${this._font.family}|${this._font.style}`)) throw new Error(`unloaded font ${this._font.family} ${this._font.style}`); this._chars = s; this.width = Math.max(1, s.length * 7); }
    async setTextStyleIdAsync(id) { const st = textStyles.find((s) => s.id === id); if (!st) throw new Error('no style'); if (!loaded.has(`${st.fontName.family}|${st.fontName.style}`)) throw new Error('style font not loaded'); this.textStyleId = id; }
    getRangeAllFontNames() { return [this._font]; }
  }

  // Like Figma: assigning two flows that start on one node throws.
  const page = (name) => {
    const p = Object.assign(new Node('PAGE'), { name });
    let flows = [];
    Object.defineProperty(p, 'flowStartingPoints', {
      get: () => flows,
      set: (v) => { const ids = v.map((f) => f.nodeId); if (new Set(ids).size !== ids.length) throw new Error('in set_flowStartingPoints: Found duplicate input nodeIds'); flows = v; },
    });
    return p;
  };
  const imported = new Map();
  const libCol = { id: 'VariableCollectionId:library', name: 'library', modes: [{ modeId: 'm', name: 'Mode 1' }], defaultModeId: 'm', variableIds: [] };
  function importByKey(kind, key) {
    const hit = library && (library[kind] || []).find((x) => x.key === key);
    if (!hit) throw new Error(`no published ${kind} with key ${key}`);
    if (imported.has(key)) return imported.get(key);
    let out;
    if (kind === 'variables') { out = new Variable(hit.name, libCol, hit.type); out.remote = true; out.key = key; }
    else if (kind === 'styles') { out = { id: `S:${key}`, key, name: hit.name, fontName: hit.fontName || { family: 'Inter', style: 'Regular' }, remote: true }; textStyles.push(out); }
    else { out = new Component(); out.name = hit.name; out.key = key; out.remote = true; const t = new Text(); t.name = 'Label'; out.appendChild(t); out.createInstance = () => { const i = new Node('INSTANCE'); i.mainComponent = out; i.width = 60; i.height = 20; const l = new Text(); l.name = 'Label'; l.parent = i; i.children.push(l); return i; }; }
    imported.set(key, out);
    return out;
  }
  const root = new Node('DOCUMENT');
  root.appendChild(page('Page 1'));

  const figma = {
    root,
    currentPage: root.children[0],
    ui: { postMessage() {}, onmessage: null },
    viewport: { scrollAndZoomIntoView() {} },
    showUI() {},
    async loadAllPagesAsync() {},
    async setCurrentPageAsync(p) { figma.currentPage = p; },
    async getNodeByIdAsync(id) { return nodes.get(id) || null; },
    async loadFontAsync(f) {
      if (missingFonts.includes(f.family)) throw new Error(`font ${f.family} not available`);
      loaded.add(`${f.family}|${f.style}`);
    },
    createFrame() { const f = new Node('FRAME'); f.layoutMode = 'NONE'; figma.currentPage.appendChild(f); return f; }, // like Figma: lands on the current page
    createText() { return new Text(); },
    createRectangle() { return new Node('RECTANGLE'); },
    createComponent() { const c = new Component(); figma.currentPage.appendChild(c); return c; },
    combineAsVariants(nodes, parent) {
      if (!nodes.length || nodes.some((n) => n.type !== 'COMPONENT')) throw new Error('combineAsVariants needs components');
      const pageOfNode = (n) => { while (n && n.type !== 'PAGE') n = n.parent; return n; };
      const target = pageOfNode(parent);
      if (nodes.some((n) => pageOfNode(n) !== target)) throw new Error('in combineAsVariants: Grouped nodes must be in the same page as the parent');
      const set = new ComponentSet();
      for (const n of nodes) set.appendChild(n);
      set.componentPropertyDefinitions; // throws on bad variant names, like Figma
      parent.appendChild(set);
      return set;
    },
    createSection() { return new Node('SECTION'); },
    createPage() { const p = page('Page'); root.appendChild(p); return p; },
    createNodeFromSvg(svg) { if (!svg.startsWith('<svg')) throw new Error('bad svg'); const f = new Node('FRAME'); const v = new Node('VECTOR'); v.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; f.appendChild(v); f.width = 24; f.height = 24; return f; },
    createTextStyle() { const s = { id: nid('S'), name: '', fontName: { family: 'Inter', style: 'Regular' } }; textStyles.push(s); return s; },
    async getLocalTextStylesAsync() { return textStyles.filter((s) => !s.remote); },
    async importStyleByKeyAsync(key) { return importByKey('styles', key); },
    async importComponentByKeyAsync(key) { return importByKey('components', key); },
    variables: {
      async getLocalVariableCollectionsAsync() { return [...cols.values()]; },
      async getLocalVariablesAsync() { return [...vars.values()].filter((v) => !v.remote); },
      async importVariableByKeyAsync(key) { return importByKey('variables', key); },
      async getVariableByIdAsync(id) { return vars.get(id) || null; },
      async getVariableCollectionByIdAsync(id) { return cols.get(id) || null; },
      createVariableCollection: (name) => new Collection(name),
      createVariable: (name, col, type) => new Variable(name, typeof col === 'string' ? cols.get(col) : col, type),
      createVariableAlias: (v) => ({ type: 'VARIABLE_ALIAS', id: v.id }),
      setBoundVariableForEffect(effect, field, v) { if (!vars.has(v.id)) throw new Error('missing var'); return { ...effect, boundVariables: { [field]: { type: 'VARIABLE_ALIAS', id: v.id } } }; },
      setBoundVariableForPaint(paint, field, v) { if (!vars.has(v.id)) throw new Error('missing var'); return { ...paint, boundVariables: { [field]: { type: 'VARIABLE_ALIAS', id: v.id } } }; },
    },
  };
  return { figma, vars, cols, nodes, textStyles, loaded };
}

/**
 * Widget API stubs on top of createFigma (figma-pack/widget tests): figma.widget with h, layout
 * components as plain tags, synced state/maps, property menu; plus the plugin calls a widget uses.
 * render() runs the registered component and expands function components into a plain tree.
 */
export function installWidget(figma) {
  const state = new Map();
  const maps = new Map();
  const sent = [];
  let menu = null;
  let component = null;
  const h = (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false) });
  const syncedMap = () => {
    const m = new Map();
    return {
      get: (k) => m.get(k), set: (k, v) => { m.set(k, JSON.parse(JSON.stringify(v))); }, delete: (k) => { m.delete(k); }, has: (k) => m.has(k),
      keys: () => [...m.keys()], values: () => [...m.values()], entries: () => [...m.entries()], get size() { return m.size; },
    };
  };
  figma.widget = {
    h, Fragment: 'Fragment', AutoLayout: 'AutoLayout', Frame: 'Frame', Text: 'Text', Rectangle: 'Rectangle', Ellipse: 'Ellipse', SVG: 'SVG', Input: 'Input', Span: 'Span',
    useSyncedState(key, init) {
      if (!state.has(key)) state.set(key, typeof init === 'function' ? init() : init);
      // Synced state must be JSON-serialisable in Figma: the copy proves it.
      return [state.get(key), (v) => state.set(key, JSON.parse(JSON.stringify(typeof v === 'function' ? v(state.get(key)) : v === undefined ? null : v)))];
    },
    useSyncedMap(name) { if (!maps.has(name)) maps.set(name, syncedMap()); return maps.get(name); },
    usePropertyMenu(items, handler) {
      for (const i of items) if (i.itemType !== 'separator' && !i.propertyName) throw new Error('property menu item without propertyName');
      menu = { items, handler };
    },
    useEffect() {},
    useWidgetNodeId: () => 'widget:1',
    waitForTask() {},
    register(fn) { component = fn; },
  };
  figma.editorType = 'figma';
  figma.notifications = [];
  figma.notify = (text) => { figma.notifications.push(text); return { cancel() {} }; };
  figma.closePlugin = () => { figma.closed = true; };
  figma.showUI = (html, opts) => { figma.uiShown = { html, opts }; };
  figma.ui = { postMessage: (m) => sent.push(m), onmessage: null };

  const expand = (node) => {
    if (!node || typeof node !== 'object') return node;
    if (typeof node.type === 'function') return expand(node.type({ ...node.props, children: node.children }));
    return { ...node, children: node.children.map(expand) };
  };
  const walk = (node, fn) => { if (node && typeof node === 'object') { fn(node); node.children.forEach((c) => walk(c, fn)); } };
  return {
    state, maps, sent,
    get menu() { return menu; },
    get registered() { return !!component; },
    render() { menu = null; return expand(h(component, {})); },
    texts(tree) { const out = []; walk(tree, (n) => { if (n.type === 'Text') out.push(n.children.join('')); }); return out; },
    find(tree, fn) { const out = []; walk(tree, (n) => { if (fn(n)) out.push(n); }); return out; },
  };
}

// Builds a small shadcn-kit-shaped file: Tailwind -> Style -> Mode, plus a legacy custom token.
export async function seedKit(figma, tokens) {
  const v = figma.variables;
  const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255, a: 1 });
  const tw = v.createVariableCollection('Tailwind');
  const palette = { 'neutral/50': '#fafafa', 'neutral/100': '#f5f5f5', 'neutral/200': '#e5e5e5', 'neutral/500': '#737373', 'neutral/900': '#171717', 'neutral/950': '#0a0a0a', 'zinc/100': '#f4f4f5', 'zinc/800': '#27272a', 'amber/400': '#ffb900', 'amber/500': '#fe9a00', 'amber/950': '#461901', 'green/500': '#00c950', 'green/600': '#00a63e', 'green/950': '#032e15', 'blue/500': '#2b7fff', 'blue/600': '#155dfc', red: '#e7000b', white: '#ffffff' };
  const twv = {};
  for (const [k, h] of Object.entries(palette)) { twv[k] = v.createVariable(`colors/${k}`, tw, 'COLOR'); twv[k].setValueForMode(tw.defaultModeId, hex(h)); }
  const style = v.createVariableCollection('Style');
  style.renameMode(style.defaultModeId, 'Vega');
  style.addMode('Nova');
  const mode = v.createVariableCollection('Mode');
  mode.renameMode(mode.defaultModeId, 'Light');
  const darkId = mode.addMode('Dark');
  for (const t of tokens) {
    const sv = {};
    for (const theme of ['light', 'dark']) {
      sv[theme] = v.createVariable(`color/${theme}/${t}`, style, 'COLOR');
      for (const m of style.modes) sv[theme].setValueForMode(m.modeId, v.createVariableAlias(twv[theme === 'light' ? 'neutral/100' : 'neutral/900']));
    }
    const mv = v.createVariable(t, mode, 'COLOR');
    mv.setValueForMode(mode.defaultModeId, v.createVariableAlias(sv.light));
    mv.setValueForMode(darkId, v.createVariableAlias(sv.dark));
  }
  const legacy = v.createVariable('custom/mmarket/mmarket badge bg slate', mode, 'COLOR');
  legacy.setValueForMode(mode.defaultModeId, v.createVariableAlias(twv['zinc/100']));
  legacy.setValueForMode(darkId, v.createVariableAlias(twv['zinc/800']));
  const font = v.createVariable('font/family/sans', style, 'STRING');
  for (const m of style.modes) font.setValueForMode(m.modeId, 'Inter');
  for (const r of [['sm', 6], ['md', 8], ['lg', 10], ['xl', 14]]) {
    const rv = v.createVariable(`radius/${r[0]}`, style, 'FLOAT');
    for (const m of style.modes) rv.setValueForMode(m.modeId, r[1]);
  }
  const ts = figma.createTextStyle();
  ts.name = 'text-sm/leading-normal/medium';
  ts.fontName = { family: 'Inter Mbank', style: 'Medium' };
  return { tw, style, mode, legacy };
}
