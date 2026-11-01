// Component contract mbank/component@1 (docs/component-contract.md): pure logic shared by the
// Figma plugin and tests. contract -> variant list, resolved style per variant and state,
// property -> binding target, layout mapping, binding rows for the UI, diff for update in place.

export const SCHEMA = 'mbank/component@1';
export const STATES = ['default', 'hover', 'active', 'focus', 'disabled'];
// Extra states a contract may declare in c.states (invalid, checked, indeterminate, selected…):
// in Figma they are more state=<s> values, in code modifiers from code.modifiers.
export const statesAllowed = (c) => [...new Set([...STATES, ...((c && c.states) || [])])];
export const STEP = 4; // contract spacing unit: 11 = 44 px

const KINDS = {
  bg: 'color', fg: 'color', border: 'color', 'focus-ring': 'color',
  radius: 'radius', height: 'space', 'min-height': 'space', px: 'space', py: 'space', pt: 'space', pb: 'space', gap: 'space', size: 'space',
  text: 'text', weight: 'weight', 'border-width': 'number', opacity: 'number', shadow: 'shadow', layout: 'layout', align: 'layout', hidden: 'flag',
};
export const PROPS = Object.keys(KINDS);
export const WEIGHTS = ['regular', 'medium', 'semibold', 'bold'];
const TEXT_PART = /^(label|text|title|placeholder|value|description|caption|hint)$/;
const ICON_PART = /icon/;

export const propKind = (prop) => KINDS[prop] || null;
/** Part kind: anatomy.<part>.kind when the contract sets it, else guessed from the part name. */
export function partKind(part, c) {
  if (part === 'root') return 'root';
  const set = c && c.anatomy && c.anatomy[part] && c.anatomy[part].kind;
  if (set) return set;
  return TEXT_PART.test(part) ? 'text' : ICON_PART.test(part) ? 'icon' : 'frame';
}

// anatomy (optional, Figma structure only, no tokens): { <part>: { parent, kind, layer, sample, width, fill, sides, component, icon } }.
// layer = Figma layer name (default: the part name); keep the designers' names so Swap instance keeps text overrides.
export const ANATOMY_KINDS = ['text', 'frame', 'icon', 'instance'];
const SIDES = ['top', 'right', 'bottom', 'left'];
/** Parent part of a part ('root' unless anatomy says otherwise). */
export const parentOf = (c, part) => (part === 'root' ? null : (c.anatomy && c.anatomy[part] && c.anatomy[part].parent) || 'root');

function checkAnatomy(errors, c) {
  if (c.anatomy === undefined) return;
  if (!isObj(c.anatomy)) { errors.push('anatomy: объект'); return; }
  for (const [part, a] of Object.entries(c.anatomy)) {
    const where = `anatomy.${part}`;
    if (!c.parts.includes(part)) { errors.push(`${where}: часть не объявлена в parts`); continue; }
    if (!isObj(a)) { errors.push(`${where}: объект`); continue; }
    if (a.kind !== undefined && !ANATOMY_KINDS.includes(a.kind)) errors.push(`${where}.kind: ${ANATOMY_KINDS.join(' | ')}`);
    if (a.parent !== undefined) {
      const i = c.parts.indexOf(a.parent);
      if (i < 0) errors.push(`${where}.parent: нет части «${a.parent}»`);
      else if (i >= c.parts.indexOf(part)) errors.push(`${where}.parent: «${a.parent}» должна стоять в parts раньше`);
      else if (!['root', 'frame'].includes(partKind(a.parent, c))) errors.push(`${where}.parent: «${a.parent}» не рамка`);
    }
    if (a.width !== undefined && !(typeof a.width === 'number' && a.width > 0)) errors.push(`${where}.width: число px`);
    if (a.fill !== undefined && typeof a.fill !== 'boolean') errors.push(`${where}.fill: true | false`);
    if (a.sides !== undefined && !(Array.isArray(a.sides) && a.sides.every((s) => SIDES.includes(s)))) errors.push(`${where}.sides: ${SIDES.join(', ')}`);
    if (a.sample !== undefined && typeof a.sample !== 'string') errors.push(`${where}.sample: строка`);
    if (a.icon !== undefined && typeof a.icon !== 'string') errors.push(`${where}.icon: имя иконки`);
    if (a.layer !== undefined && !(typeof a.layer === 'string' && a.layer.trim())) errors.push(`${where}.layer: имя слоя — непустая строка`);
    if (a.kind === 'instance' && !(isObj(a.component) && typeof a.component.name === 'string')) errors.push(`${where}.component: { name, key }`);
  }
}

/** 'bg:hover' -> { prop: 'bg', state: 'hover' }; plain keys are the default state. */
export function splitKey(key) {
  const i = key.indexOf(':');
  return i < 0 ? { prop: key, state: 'default' } : { prop: key.slice(0, i), state: key.slice(i + 1) };
}
export const joinKey = (prop, state) => (!state || state === 'default' ? prop : `${prop}:${state}`);

/** 'ring/50' -> { token: 'ring', opacity: 0.5 }. */
export function splitToken(value) {
  const [token, op] = String(value).split('/');
  return { token, opacity: op === undefined ? 1 : Number(op) / 100 };
}

const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);

function checkStyles(errors, where, styles, c) {
  if (!isObj(styles)) { errors.push(`${where}: должен быть объектом`); return; }
  for (const [part, props] of Object.entries(styles)) {
    if (!c.parts.includes(part)) { errors.push(`${where}: часть «${part}» не объявлена в parts`); continue; }
    if (!isObj(props)) { errors.push(`${where}.${part}: должен быть объектом`); continue; }
    for (const [key, value] of Object.entries(props)) {
      const { prop, state } = splitKey(key);
      if (!KINDS[prop]) errors.push(`${where}.${part}: неизвестное свойство «${prop}»`);
      if (!statesAllowed(c).includes(state)) errors.push(`${where}.${part}: неизвестное состояние «${state}»`);
      if (KINDS[prop] === 'color' && (typeof value !== 'string' || /^#|^rgb|^oklch/i.test(value)))
        errors.push(`${where}.${part}.${key}: цвет — только имя токена, не «${value}»`);
      if (KINDS[prop] === 'space' && !(typeof value === 'number' && value >= 0)) errors.push(`${where}.${part}.${key}: шаг сетки — число`);
      if (KINDS[prop] === 'flag' && typeof value !== 'boolean') errors.push(`${where}.${part}.${key}: true или false`);
      if (prop === 'weight' && !WEIGHTS.includes(value)) errors.push(`${where}.${part}.weight: ${WEIGHTS.join(' | ')}`);
    }
  }
}

/** Errors in Russian for the designer; [] when the contract is usable. */
export function validateContract(c) {
  if (!isObj(c)) return ['контракт: не объект'];
  const errors = [];
  if (c.$schema !== SCHEMA) errors.push(`$schema: ожидается ${SCHEMA}`);
  if (!/^[a-z][a-z0-9-]*$/.test(c.name || '')) errors.push('name: kebab-case латиницей, как имя файла');
  if (!Array.isArray(c.parts) || !c.parts.includes('root')) { errors.push('parts: массив с "root"'); return errors; }
  if (!isObj(c.props)) errors.push('props: объект');
  for (const [p, d] of Object.entries(c.props || {})) {
    if (p === 'state') errors.push('props.state: зарезервировано, состояния задаются в states');
    if (!isObj(d) || !Array.isArray(d.values) || !d.values.length) { errors.push(`props.${p}.values: непустой массив`); continue; }
    if (d.default !== undefined && !d.values.includes(d.default)) errors.push(`props.${p}.default: нет в values`);
    for (const v of d.values) if (!isObj(c.variants?.[p]?.[v])) errors.push(`variants.${p}.${v}: не описан`);
  }
  for (const s of c.states || []) if (!/^[a-z][a-z0-9-]*$/.test(s)) errors.push(`states: «${s}» — kebab-case латиницей`);
  checkAnatomy(errors, c);
  if (c.base) checkStyles(errors, 'base', c.base, c);
  for (const [p, byValue] of Object.entries(c.variants || {})) {
    if (!c.props?.[p]) { errors.push(`variants.${p}: нет такого свойства в props`); continue; }
    for (const [v, styles] of Object.entries(byValue)) checkStyles(errors, `variants.${p}.${v}`, styles, c);
  }
  (c.compound || []).forEach((cv, i) => {
    if (!isObj(cv.when)) errors.push(`compound[${i}].when: объект`);
    const { when, ...styles } = cv;
    checkStyles(errors, `compound[${i}]`, styles, c);
  });
  return errors;
}

/** Every combination of props, in declaration order: [{ variant: 'primary', size: 'sm' }, ...]. */
export function combos(c) {
  let out = [{}];
  for (const [p, d] of Object.entries(c.props || {})) out = out.flatMap((o) => d.values.map((v) => ({ ...o, [p]: v })));
  return out;
}

export const statesOf = (c) => (c.states && c.states.length ? c.states : ['default']);

/** Figma variant name: 'variant=primary, size=sm, state=hover' (state only when there are several). */
export function variantName(props, state, withState = true) {
  const pairs = Object.entries(props).map(([k, v]) => `${k}=${v}`);
  if (withState) pairs.push(`state=${state}`);
  return pairs.join(', ') || 'default';
}

/** contract -> [{ props, state, name }]: one Figma variant per combination of props x states. */
export function variantList(c) {
  const states = statesOf(c);
  return combos(c).flatMap((props) => states.map((state) => ({ props, state, name: variantName(props, state, states.length > 1) })));
}

// Style layers that apply to one combination, weakest first.
function layers(c, props) {
  const out = [{ source: 'base', styles: c.base || {} }];
  for (const [p, v] of Object.entries(props)) out.push({ source: `${p}=${v}`, styles: c.variants?.[p]?.[v] || {} });
  (c.compound || []).forEach((cv, i) => {
    const { when, ...styles } = cv;
    if (Object.entries(when || {}).every(([k, v]) => props[k] === v)) out.push({ source: `compound:${i}`, styles });
  });
  return out;
}

/**
 * Resolved style of every part for one variant: { root: { bg: 'primary-hover', ... }, label: {...} }.
 * State keys win over plain ones; focus-ring only shows in the focus state; disabled without
 * any explicit disabled style falls back to 50% opacity (shadcn convention).
 */
export function resolveStyle(c, props, state = 'default') {
  const out = {};
  for (const part of c.parts) {
    const plain = {};
    const stated = {};
    for (const { styles } of layers(c, props)) {
      for (const [key, value] of Object.entries(styles[part] || {})) {
        const k = splitKey(key);
        if (k.state === 'default') plain[k.prop] = value;
        else if (k.state === state) stated[k.prop] = value;
      }
    }
    const s = { ...plain, ...stated };
    if (state !== 'focus') delete s['focus-ring'];
    out[part] = s;
  }
  if (state === 'disabled' && !JSON.stringify(c).includes(':disabled')) out.root.opacity = 50;
  return out;
}

/** Text and icon parts inherit fg, text and weight from root. */
export function inherited(style, part, prop, fallback) {
  return style[part]?.[prop] ?? style.root?.[prop] ?? fallback;
}

/** Contract property -> Figma fields it drives (what setBoundVariable binds). */
export function bindingTarget(prop) {
  switch (prop) {
    case 'bg': return { kind: 'paint', field: 'fills' };
    case 'fg': return { kind: 'paint', field: 'fills', on: 'text' };
    case 'border': return { kind: 'paint', field: 'strokes' };
    case 'focus-ring': return { kind: 'effect', field: 'effects' };
    case 'radius': return { kind: 'float', fields: ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'] };
    case 'px': return { kind: 'float', fields: ['paddingLeft', 'paddingRight'] };
    case 'py': return { kind: 'float', fields: ['paddingTop', 'paddingBottom'] };
    case 'pt': return { kind: 'float', fields: ['paddingTop'] };
    case 'pb': return { kind: 'float', fields: ['paddingBottom'] };
    case 'gap': return { kind: 'float', fields: ['itemSpacing'] };
    case 'height': return { kind: 'float', fields: ['height'] };
    case 'min-height': return { kind: 'float', fields: ['minHeight'] };
    case 'size': return { kind: 'float', fields: ['width', 'height'] };
    case 'border-width': return { kind: 'number', fields: ['strokeWeight'] };
    case 'text': case 'weight': return { kind: 'textStyle', on: 'text' };
    case 'opacity': return { kind: 'number', fields: ['opacity'] };
    default: return null;
  }
}

const ALIGN = { start: 'MIN', center: 'CENTER', end: 'MAX', between: 'CENTER' };

/** Auto layout of one part: frame properties in px (variables are bound on top by the plugin). */
export function layoutFor(s = {}) {
  const px = (v) => (typeof v === 'number' ? v * STEP : 0);
  const row = (s.layout || 'row') !== 'column';
  const out = {
    layoutMode: row ? 'HORIZONTAL' : 'VERTICAL',
    primaryAxisAlignItems: s.align === 'between' ? 'SPACE_BETWEEN' : row && s.align === 'center' ? 'CENTER' : row && s.align === 'end' ? 'MAX' : 'MIN',
    counterAxisAlignItems: ALIGN[s.align] || (row ? 'CENTER' : 'MIN'),
    itemSpacing: px(s.gap),
    paddingLeft: px(s.px), paddingRight: px(s.px), paddingTop: px(s.pt ?? s.py), paddingBottom: px(s.pb ?? s.py),
    primaryAxisSizingMode: 'AUTO', counterAxisSizingMode: 'AUTO',
  };
  if (s.size !== undefined) { out.width = px(s.size); out.height = px(s.size); out.primaryAxisSizingMode = 'FIXED'; out.counterAxisSizingMode = 'FIXED'; }
  else if (s.height !== undefined) { out.height = px(s.height); if (row) out.counterAxisSizingMode = 'FIXED'; else out.primaryAxisSizingMode = 'FIXED'; }
  if (s['min-height'] !== undefined) out.minHeight = px(s['min-height']);
  return out;
}

/** Every token-bearing property with where it lives in the contract, for the bindings table. */
export function bindingRows(c) {
  const rows = [];
  const push = (source, path, styles) => {
    for (const [part, props] of Object.entries(styles || {})) {
      if (!isObj(props)) continue;
      for (const [key, value] of Object.entries(props)) {
        const { prop, state } = splitKey(key);
        if (!['color', 'radius', 'space', 'text', 'weight'].includes(KINDS[prop])) continue;
        rows.push({ id: [...path, part, key].join('.'), source, path: [...path, part], key, part, prop, state, kind: KINDS[prop], value });
      }
    }
  };
  push('base', ['base'], c.base);
  for (const [p, byValue] of Object.entries(c.variants || {})) for (const [v, styles] of Object.entries(byValue)) push(`${p}=${v}`, ['variants', p, v], styles);
  (c.compound || []).forEach((cv, i) => {
    const { when, ...styles } = cv;
    push(Object.entries(when || {}).map(([k, v]) => `${k}=${v}`).join(' + '), ['compound', String(i)], styles);
  });
  return rows;
}

/** Returns a new contract with path.key = value (null removes it). Creates missing objects. */
export function setBinding(c, path, key, value) {
  const next = JSON.parse(JSON.stringify(c));
  let o = next;
  for (const seg of path) {
    if (o[seg] === undefined) o[seg] = {};
    o = o[seg];
  }
  if (value === null || value === undefined || value === '') delete o[key];
  else o[key] = value;
  return next;
}

/** Every token the contract uses, by kind: { color: Set, radius: Set, space: Set, text: Set }. */
export function tokensUsed(c) {
  const out = { color: new Set(), radius: new Set(), space: new Set(), text: new Set() };
  for (const r of bindingRows(c)) {
    if (r.kind === 'color') out.color.add(splitToken(r.value).token);
    else if (out[r.kind]) out[r.kind].add(r.value);
  }
  return out;
}

const normName = (name) => String(name).split(',').map((s) => s.trim().replace(/\s*=\s*/, '=')).filter(Boolean).sort().join(', ');

/**
 * Update in place: existing variant components [{ id, name }] vs wanted variant names.
 * keep = reused (same node, instances stay linked), create = new, stale = no longer in the contract.
 */
export function diffVariants(existing, wanted) {
  const byName = new Map(existing.map((e) => [normName(e.name), e]));
  const keep = [];
  const create = [];
  for (const w of wanted) {
    const hit = byName.get(normName(w.name));
    if (hit) { keep.push({ ...w, id: hit.id }); byName.delete(normName(w.name)); } else create.push(w);
  }
  return { keep, create, stale: [...byName.values()] };
}
