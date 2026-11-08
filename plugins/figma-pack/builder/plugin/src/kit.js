// Kit components on screens: first the set built from the contract (place.js, plugin data), then a
// component found by name in a foreign kit (ROLES), last our own token-bound drawing (counted as a fallback).
import { box, text, add, fill, stroke, round, sizing, skel } from './draw.js';
import { place, count } from './place.js';

export const ROLES = {
  button: ['button'], badge: ['badge'], input: ['input', 'text-field', 'textfield'],
  checkbox: ['checkbox'], switch: ['switch', 'toggle'], avatar: ['avatar'],
  select: ['select'], textarea: ['textarea'], tabs: ['tabs'], separator: ['separator', 'divider'],
};
const norm = (s) => s.toLowerCase().replace(/^[^a-z]+/, '').replace(/[\s_/]+/g, '-');

function variantProps(node) {
  const out = {};
  const defs = node.type === 'COMPONENT_SET' ? node.componentPropertyDefinitions : {};
  for (const [k, d] of Object.entries(defs)) if (d.type === 'VARIANT') out[k] = d.variantOptions;
  return out;
}

function textProps(node) {
  const defs = node.componentPropertyDefinitions || {};
  return Object.keys(defs).filter((k) => defs[k].type === 'TEXT');
}

export async function scanKit() {
  await figma.loadAllPagesAsync();
  const nodes = figma.root.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })
    .filter((n) => !(n.type === 'COMPONENT' && n.parent && n.parent.type === 'COMPONENT_SET'));
  const kit = {};
  const all = [];
  for (const n of nodes) {
    const name = norm(n.name);
    all.push({ id: n.id, name: n.name, type: n.type, variants: variantProps(n), texts: textProps(n) });
    for (const [role, names] of Object.entries(ROLES)) {
      if (kit[role]) continue;
      if (names.some((x) => name === x || name.endsWith(`-${x}`))) kit[role] = { id: n.id, name: n.name };
    }
  }
  return { kit, components: all };
}

// Chooses the variant whose values best match the wanted words (case-insensitive).
function pickVariant(set, want) {
  const props = variantProps(set);
  const chosen = {};
  for (const [prop, options] of Object.entries(props)) {
    const p = prop.toLowerCase();
    for (const [k, val] of Object.entries(want)) {
      if (!p.includes(k)) continue;
      const hit = options.find((o) => o.toLowerCase() === String(val).toLowerCase());
      if (hit) chosen[prop] = hit;
    }
  }
  return chosen;
}

async function setLabel(inst, label) {
  const defs = inst.componentProperties || {};
  const key = Object.keys(defs).find((k) => defs[k].type === 'TEXT' && /label|text|title|placeholder|value/i.test(k))
    || Object.keys(defs).find((k) => defs[k].type === 'TEXT');
  if (key) { inst.setProperties({ [key]: label }); return true; }
  const t = inst.findOne((n) => n.type === 'TEXT' && n.visible);
  if (!t) return false;
  const fonts = t.getRangeAllFontNames(0, t.characters.length);
  for (const f of fonts) await figma.loadFontAsync(f);
  t.characters = label;
  return true;
}

async function instance(ctx, role, want, label) {
  const ref = ctx.kit && ctx.kit[role];
  if (!ref) return null;
  const node = await figma.getNodeByIdAsync(ref.id);
  if (!node) return null;
  const comp = node.type === 'COMPONENT_SET' ? node.defaultVariant : node;
  const inst = comp.createInstance();
  if (node.type === 'COMPONENT_SET') {
    const v = pickVariant(node, want);
    if (Object.keys(v).length) try { inst.setProperties(v); } catch (e) { /* keep default */ }
  }
  if (label != null) {
    try { await setLabel(inst, label); } catch (e) { inst.remove(); return null; } // kit font not installed
  }
  count(ctx, role, true);
  return inst;
}

const BTN = {
  default: ['primary', 'primary-foreground', null], secondary: ['secondary', 'secondary-foreground', null],
  outline: ['background', 'foreground', 'border'], ghost: [null, 'foreground', null],
  destructive: ['destructive', 'destructive-foreground', null],
};

// Screen words -> the Mbank kit's variant names (contracts/button.json, badge.json).
const BTN_VARIANT = { default: 'primary', secondary: 'secondary', outline: 'outline', ghost: 'ghost', destructive: 'destructive', link: 'link' };
const BTN_SIZE = { default: 'md', sm: 'sm', lg: 'lg', icon: 'icon' };
const BADGE_TONE = { default: 'accent', secondary: 'neutral', outline: 'clear', destructive: 'error', success: 'success', warning: 'warning', info: 'info' };

export async function button(ctx, label, variant = 'default', sz = 'default') {
  const props = { variant: BTN_VARIANT[variant] || variant, size: BTN_SIZE[sz] || sz, state: 'default' };
  const inst = (await place(ctx, 'button', { props, label })) || (await instance(ctx, 'button', { ...props, type: variant, style: variant }, label));
  if (inst) return inst;
  count(ctx, 'button', false);
  const [bg, fg, border] = BTN[variant] || BTN.default;
  const b = box(ctx, `Button / ${variant}`, { dir: 'H', gap: 8, pad: sz === 'sm' ? [6, 12] : [8, 16], fill: bg, stroke: border, radius: 'md', align: 'CENTER', justify: 'CENTER' });
  return add(b, await text(ctx, label, { size: 'sm', weight: 'medium', color: fg }));
}

const BADGE = {
  default: ['primary', 'primary-foreground'], secondary: ['secondary', 'secondary-foreground'],
  outline: [null, 'foreground'], destructive: ['destructive', 'destructive-foreground'],
  success: ['success', 'success-foreground'], warning: ['warning', 'warning-foreground'], info: ['info', 'info-foreground'],
};

export async function badge(ctx, label, variant = 'secondary') {
  const props = { tone: BADGE_TONE[variant] || 'neutral', fill: 'ghost', shape: 'rounded', size: 'md' };
  const inst = (await place(ctx, 'badge', { props, label })) || (await instance(ctx, 'badge', { ...props, variant, type: variant }, label));
  if (inst) return inst;
  count(ctx, 'badge', false);
  const [bg, fg] = BADGE[variant] || BADGE.secondary;
  const b = box(ctx, `Badge / ${variant}`, { dir: 'H', pad: [2, 8], fill: bg, stroke: variant === 'outline' ? 'border' : null, radius: 'full', align: 'CENTER' });
  return add(b, await text(ctx, label, { size: 'xs', weight: 'medium', color: fg }));
}

/**
 * Text field: o.kind picks the contract (search-input, select-trigger, textarea, date-picker-trigger; plain input
 * when that set is missing), o.error the invalid state, o.w the width (fills its column by default).
 */
export async function input(ctx, placeholder, o = {}) {
  const props = { state: o.error ? 'invalid' : 'default', size: 'md' };
  const w = o.w || 'fill';
  const own = o.kind && (await place(ctx, o.kind, { props, texts: { Placeholder: placeholder }, w }));
  if (own) return own;
  let inst = await place(ctx, 'input', { props, texts: { Placeholder: placeholder }, w });
  if (!inst && (inst = await instance(ctx, 'input', props, placeholder))) {
    // A kit instance keeps its own width unless told otherwise: fields fill their column by default.
    if (typeof w === 'number') inst.resize(w, inst.height);
    else sizing(inst, w);
  }
  if (inst) {
    if (o.kind) count(ctx, o.kind, 'stand-in'); // its own set is missing: a plain input stands in
    return inst;
  }
  count(ctx, o.kind || 'input', false);
  const f = box(ctx, 'Input', { dir: 'H', gap: 8, pad: [8, 12], fill: 'background', stroke: o.error ? 'destructive' : 'input', radius: 'md', align: 'CENTER', w: o.w || 'fill', h: 36 });
  return add(f, await text(ctx, placeholder, { size: 'sm', color: 'muted-foreground', truncate: true }));
}

export async function avatar(ctx, name, d = 32) {
  const initials = String(name).split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const props = { size: d <= 24 ? 'xs' : d <= 32 ? 'sm' : d <= 40 ? 'md' : 'lg' };
  const inst = (await place(ctx, 'avatar', { props, label: initials })) || (await instance(ctx, 'avatar', props, initials));
  if (inst) return inst;
  count(ctx, 'avatar', false);
  const a = box(ctx, 'Avatar', { dir: 'H', fill: 'muted', radius: 'full', align: 'CENTER', justify: 'CENTER', w: d, h: d });
  a.primaryAxisSizingMode = 'FIXED';
  a.counterAxisSizingMode = 'FIXED';
  return add(a, await text(ctx, initials, { size: 'xs', weight: 'medium', color: 'muted-foreground' }));
}

export async function checkbox(ctx, checked = false) {
  const inst = (await place(ctx, 'checkbox', { props: { state: checked ? 'checked' : 'default' } }))
    || (await instance(ctx, 'checkbox', { checked: checked ? 'true' : 'false', state: checked ? 'checked' : 'default' }, null));
  if (inst) return inst;
  count(ctx, 'checkbox', false);
  const c = figma.createRectangle();
  c.name = 'Checkbox';
  c.resize(16, 16);
  fill(c, ctx, checked ? 'primary' : 'background');
  stroke(c, ctx, checked ? 'primary' : 'input');
  round(c, ctx, 'sm');
  return c;
}

export async function radio(ctx, checked = false) {
  const inst = await place(ctx, 'radio', { props: { state: checked ? 'checked' : 'default' } });
  if (inst) return inst;
  count(ctx, 'radio', false);
  const c = figma.createEllipse ? figma.createEllipse() : figma.createRectangle();
  c.name = 'Radio';
  c.resize(16, 16);
  fill(c, ctx, 'background');
  stroke(c, ctx, checked ? 'primary' : 'input', checked ? 5 : 1);
  if (!figma.createEllipse) round(c, ctx, 'full');
  return c;
}

/** Loading placeholder: the skeleton contract (line / circle / block) at w x h, else a muted bar. */
export async function skeleton(ctx, w, h = 12, radius = 'sm') {
  const shape = radius === 'full' && w === h ? 'circle' : h >= 24 ? 'block' : 'line';
  const inst = await place(ctx, 'skeleton', { props: { shape }, w: typeof w === 'number' ? w : 'fill', h });
  if (inst) return inst;
  count(ctx, 'skeleton', false);
  return skel(ctx, w, h, radius);
}

// Status label -> badge variant, so tables read at a glance.
export function statusVariant(label) {
  const s = String(label).toLowerCase();
  if (/низк\S* риск|проверен|пройден|подключ|работает/.test(s)) return 'success';
  if (/высок\S* риск|сбой/.test(s)) return 'destructive';
  if (/средн\S* риск|медленно|ожида/.test(s)) return 'warning';
  if (/одобр|выдан|оплач|успеш|актив|готов|approved|done|paid|active/.test(s)) return 'success';
  if (/отказ|отклон|ошиб|просроч|блок|rejected|failed|overdue|blocked/.test(s)) return 'destructive';
  if (/провер|ожида|скоринг|review|pending|wait/.test(s)) return 'warning';
  if (/нов|new/.test(s)) return 'info';
  return 'secondary';
}
