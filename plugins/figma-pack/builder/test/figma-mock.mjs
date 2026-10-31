// Minimal in-memory Figma Plugin API. Mirrors the rules that break real plugins:
// FILL/HUG sizing context, unloaded fonts, alias targets, readonly paints.
let seq = 0;
const nid = (p) => `${p}:${++seq}`;

export function createFigma({ missingFonts = ['Inter Mbank'] } = {}) {
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
    appendChild(c) { if (c.parent) c.parent.children = c.parent.children.filter((x) => x !== c); c.parent = this; this.children.push(c); this._grow(c); }
    _grow(c) { if (this.layoutMode === 'VERTICAL') this.height = (this.height || 0) + c.height; }
    resize(w, h) { if (!(w > 0 && h > 0)) throw new Error(`bad size ${w}x${h} on ${this.name}`); this.width = w; this.height = h; }
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
  }

  // Components: a set's children are COMPONENT variants named 'prop=value, ...'.
  class Component extends Node {
    constructor() { super('COMPONENT'); this.layoutMode = 'NONE'; this.description = ''; this.key = `key-${this.id}`; }
    createInstance() {
      const i = new Node('INSTANCE');
      i.mainComponent = this;
      i.width = this.width; i.height = this.height;
      return i;
    }
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
      return defs;
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

  const page = (name) => Object.assign(new Node('PAGE'), { name });
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
    createFrame() { const f = new Node('FRAME'); f.layoutMode = 'NONE'; return f; },
    createText() { return new Text(); },
    createRectangle() { return new Node('RECTANGLE'); },
    createComponent() { const c = new Component(); figma.currentPage.appendChild(c); return c; },
    combineAsVariants(nodes, parent) {
      if (!nodes.length || nodes.some((n) => n.type !== 'COMPONENT')) throw new Error('combineAsVariants needs components');
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
    async getLocalTextStylesAsync() { return [...textStyles]; },
    variables: {
      async getLocalVariableCollectionsAsync() { return [...cols.values()]; },
      async getLocalVariablesAsync() { return [...vars.values()]; },
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
