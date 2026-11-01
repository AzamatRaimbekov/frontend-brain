// Tailwind classes <-> properties of a component contract (mbank/component@1, figma-pack builder/docs).
// One table drives both directions, so a contract renders back to exactly the classes it was read from.
// The property set is the one the Figma side binds (figma-pack builder core/contract.js); everything else
// stays code-only (code.extra). Pure Node 18+, no dependencies.
import { readFileSync } from 'node:fs';

// Default state -> Tailwind modifier; a contract adds or overrides them in code.modifiers.
export const STATE_MODIFIERS = { hover: 'hover', active: 'active', focus: 'focus-visible', disabled: 'disabled', invalid: 'aria-invalid' };
export const STATE_ORDER = ['default', 'hover', 'active', 'focus', 'disabled', 'invalid', 'selected', 'checked', 'unchecked', 'indeterminate'];

const NUM = /^\d+(\.\d+)?$/;
const SPACING = { height: 'h', 'min-height': 'min-h', size: 'size', px: 'px', py: 'py', pt: 'pt', pb: 'pb', gap: 'gap' };
const SPACING_BY_PREFIX = Object.fromEntries(Object.entries(SPACING).map(([k, v]) => [v, k]));
const WEIGHTS = { regular: 'normal', medium: 'medium', semibold: 'semibold', bold: 'bold' };
const ALIGN = ['start', 'center', 'end', 'between'];

// Property -> kind of value. color = token from tokens.css; radius/text/shadow = scale key; number = 4 px grid step.
// focus-ring = colour token with optional opacity ("ring/50"), always shown in the focus state.
// hidden = Figma-only flag (an optional part switched off in a variant); code shows such parts when they are passed.
export const PROPERTIES = {
  bg: 'color', fg: 'color', border: 'color', 'focus-ring': 'color',
  'border-width': 'number', radius: 'radius', text: 'text', weight: 'weight', shadow: 'shadow', opacity: 'number',
  layout: 'layout', align: 'align', hidden: 'flag',
  ...Object.fromEntries(Object.keys(SPACING).map((k) => [k, 'number'])),
};

// Scales from tokens.css: colours (--color-*), radius, text and shadow keys.
export function readTokens(cssPath) {
  const css = readFileSync(cssPath, 'utf8');
  const keys = (re) => new Set([...css.matchAll(re)].map((m) => m[1]).filter((k) => !k.includes('--')));
  return {
    color: keys(/--color-([\w-]+)\s*:/g),
    radius: new Set([...keys(/--radius-([\w-]+)\s*:/g), 'none', 'full']),
    text: keys(/--text-([\w-]+)\s*:/g),
    shadow: new Set([...keys(/--shadow-([\w-]+)\s*:/g), 'none']),
  };
}

// Is `value` valid for property `prop`?
export function validValue(prop, value, tokens) {
  const kind = PROPERTIES[prop];
  if (kind === 'color') {
    const [token, alpha] = String(value).split('/');
    if (alpha !== undefined && (prop !== 'focus-ring' || !NUM.test(alpha))) return false;
    return tokens.color.has(token);
  }
  if (kind === 'number') return typeof value === 'number' && value >= 0;
  if (kind === 'radius' || kind === 'text' || kind === 'shadow') return tokens[kind].has(value);
  if (kind === 'weight') return value in WEIGHTS;
  if (kind === 'layout') return value === 'row' || value === 'column';
  if (kind === 'align') return ALIGN.includes(value);
  if (kind === 'flag') return typeof value === 'boolean';
  return false;
}

// Splits "hover:[&_svg]:size-4" at top-level colons: { mods: ['hover', '[&_svg]'], util: 'size-4' }.
export function splitClass(cls) {
  const parts = [];
  let depth = 0;
  let last = 0;
  for (let i = 0; i < cls.length; i++) {
    const ch = cls[i];
    if (ch === '[' || ch === '(') depth++;
    else if (ch === ']' || ch === ')') depth--;
    else if (ch === ':' && depth === 0) {
      parts.push(cls.slice(last, i));
      last = i + 1;
    }
  }
  return { mods: parts, util: cls.slice(last) };
}

// One utility (no modifiers) -> { prop, value } or null when it is not a contract property.
// Pieces of a pair (flex + flex-col, items-center + justify-between, ring-[3px] + ring colour) come back
// as pseudo-props starting with '~' and are paired by readClasses.
export function parseUtility(util, tokens) {
  if (util === 'ring-[3px]') return { prop: '~ring-width' };
  if (util === 'flex') return { prop: '~flex' };
  if (util === 'flex-col') return { prop: '~flex-col' };
  if (util === 'justify-between') return { prop: '~between' };
  if (util === 'border') return { prop: 'border-width', value: 1 };
  let m = util.match(/^items-(\w+)$/);
  if (m && ALIGN.includes(m[1])) return { prop: 'align', value: m[1] };
  m = util.match(/^border-(\d)$/);
  if (m) return { prop: 'border-width', value: Number(m[1]) };
  m = util.match(/^(bg|text|border|ring)-(.+)$/);
  if (m) {
    const [kind, rest] = [m[1], m[2]];
    if (kind === 'text' && tokens.text.has(rest)) return { prop: 'text', value: rest };
    const [token, alpha] = rest.split('/');
    if (!tokens.color.has(token)) return null;
    if (kind === 'ring') return alpha === undefined || NUM.test(alpha) ? { prop: '~ring', value: rest } : null;
    if (alpha !== undefined) return null;
    return { prop: { bg: 'bg', text: 'fg', border: 'border' }[kind], value: token };
  }
  m = util.match(/^rounded-(.+)$/);
  if (m && tokens.radius.has(m[1])) return { prop: 'radius', value: m[1] };
  m = util.match(/^font-(\w+)$/);
  if (m) {
    const w = Object.entries(WEIGHTS).find(([, cls]) => cls === m[1]);
    if (w) return { prop: 'weight', value: w[0] };
  }
  m = util.match(/^shadow-(.+)$/);
  if (m && tokens.shadow.has(m[1])) return { prop: 'shadow', value: m[1] };
  m = util.match(/^opacity-(\d+)$/);
  if (m) return { prop: 'opacity', value: Number(m[1]) };
  m = util.match(/^(min-h|size|gap|h|px|py|pt|pb)-(.+)$/);
  if (m && NUM.test(m[2])) return { prop: SPACING_BY_PREFIX[m[1]], value: Number(m[2]) };
  return null;
}

// Utility classes (no modifiers) for one property value.
export function renderUtility(prop, value) {
  switch (prop) {
    case 'bg': return [`bg-${value}`];
    case 'fg': return [`text-${value}`];
    case 'border': return [`border-${value}`];
    case 'border-width': return [value === 1 ? 'border' : `border-${value}`];
    case 'focus-ring': return ['ring-[3px]', `ring-${value}`];
    case 'radius': return [`rounded-${value}`];
    case 'text': return [`text-${value}`];
    case 'weight': return [`font-${WEIGHTS[value]}`];
    case 'shadow': return [`shadow-${value}`];
    case 'opacity': return [`opacity-${value}`];
    case 'layout': return value === 'column' ? ['flex', 'flex-col'] : ['flex'];
    case 'align': return value === 'between' ? ['items-center', 'justify-between'] : [`items-${value}`];
    default:
      if (SPACING[prop]) return [`${SPACING[prop]}-${value}`];
      throw new Error(`unknown contract property "${prop}"`);
  }
}

const modifiersOf = (contract) => ({ ...STATE_MODIFIERS, ...(contract.code?.modifiers ?? {}) });

// Classes of one scope ({ part: { prop[:state]: value } }). `direct` = part rendered on its own element
// (its own block or a map), so it gets no part selector.
export function renderScope(scope, contract, { direct = 'root' } = {}) {
  const mods = modifiersOf(contract);
  const selectors = contract.code?.parts ?? {};
  const figmaOnly = contract.code?.figmaOnly ?? [];
  const out = [];
  for (const [part, props] of Object.entries(scope ?? {})) {
    if (part !== direct && figmaOnly.includes(part)) continue; // drawn only in Figma (code clips or renders it itself)
    for (let [key, value] of Object.entries(props ?? {})) {
      const [prop, keyState] = key.split(':');
      if (prop === 'hidden') continue;
      // code.overrides { part: { key: value | null } }: Figma auto-layout needs a different value; code keeps its own.
      const own = contract.code?.overrides?.[part];
      if (own && key in own) {
        if (own[key] === null) continue;
        value = own[key];
      }
      if (prop === 'focus-ring' && keyState) throw new Error(`${contract.name}: focus-ring takes no state suffix`);
      const state = prop === 'focus-ring' ? 'focus' : keyState;
      const prefix = [];
      if (part !== direct) {
        if (!selectors[part]) throw new Error(`${contract.name}: part "${part}" has no selector in code.parts`);
        prefix.push(selectors[part]);
      }
      if (state) {
        if (!mods[state]) throw new Error(`${contract.name}: state "${state}" has no modifier (code.modifiers)`);
        prefix.push(mods[state]);
      }
      for (const util of renderUtility(prop, value)) out.push([...prefix, util].join(':'));
    }
  }
  return out;
}

// Classes -> { scope: { part: { prop[:state]: value } }, extra: [classes] }. Anything that is not exactly
// a contract property (unknown modifier, two modifiers, a colour with opacity, half of a pair) stays extra.
export function readClasses(classes, contract, tokens, { direct = 'root' } = {}) {
  const mods = Object.fromEntries(Object.entries(modifiersOf(contract)).map(([s, m]) => [m, s]));
  const parts = Object.fromEntries(Object.entries(contract.code?.parts ?? {}).map(([p, sel]) => [sel, p]));
  const scope = {};
  const extra = [];
  const slots = {}; // part|state -> { '~flex': cls, ... } pieces waiting for their pair
  const set = (part, key, value, cls) => {
    const target = (scope[part] ??= {});
    if (key in target) extra.push(...[].concat(cls));
    else target[key] = value;
  };
  for (const cls of classes) {
    const { mods: chain, util } = splitClass(cls);
    let part = direct;
    if (chain.length && parts[chain[0]]) part = parts[chain.shift()];
    const state = chain.length === 1 ? mods[chain[0]] : chain.length ? undefined : '';
    const parsed = state === undefined ? null : parseUtility(util, tokens);
    if (!parsed) extra.push(cls);
    else if (parsed.prop.startsWith('~') || parsed.prop === 'align') {
      const slot = (slots[`${part}|${state}`] ??= { part, state });
      if (slot[parsed.prop]) extra.push(cls);
      else slot[parsed.prop] = { cls, value: parsed.value };
    } else set(part, state ? `${parsed.prop}:${state}` : parsed.prop, parsed.value, cls);
  }
  for (const s of Object.values(slots)) {
    const used = new Set();
    const take = (...keys) => keys.forEach((k) => used.add(k));
    if (!s.state) {
      if (s['~flex']) {
        set(s.part, 'layout', s['~flex-col'] ? 'column' : 'row', [s['~flex'].cls, s['~flex-col']?.cls].filter(Boolean));
        take('~flex', '~flex-col');
      }
      if (s.align && s['~between'] && s.align.value === 'center') {
        set(s.part, 'align', 'between', [s.align.cls, s['~between'].cls]);
        take('align', '~between');
      } else if (s.align) {
        set(s.part, 'align', s.align.value, s.align.cls);
        take('align');
      }
    }
    if (s.state === 'focus' && s['~ring-width'] && s['~ring']) {
      set(s.part, 'focus-ring', s['~ring'].value, [s['~ring-width'].cls, s['~ring'].cls]);
      take('~ring-width', '~ring');
    }
    for (const [k, v] of Object.entries(s)) if (v?.cls && !used.has(k)) extra.push(v.cls);
  }
  return { scope, extra };
}

export const splitWords = (text) => String(text ?? '').split(/\s+/).filter(Boolean);
export const sameSet = (a, b) => {
  const x = new Set(a);
  const y = new Set(b);
  return x.size === y.size && [...x].every((c) => y.has(c));
};
