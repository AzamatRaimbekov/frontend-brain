// Drawing primitives. Every color is bound to a token variable, never raw,
// so changing tokens re-themes the whole file.
import { TYPE_SCALE } from '../../core/tokens.js';

// Figma node proxies reject unknown properties, so sizing intent lives here.
const SIZING = new WeakMap();

const WEIGHTS = { regular: 'Regular', medium: 'Medium', semibold: 'Semi Bold', bold: 'Bold' };

export function createCtx({ vars, radius, font, kit, width, state, spec }) {
  return { vars, radius, font, kit, width, state, spec, styles: {}, kitStyles: null, stats: { instances: 0, fallbacks: 0, fallbackFonts: false } };
}

export async function loadFonts(family) {
  const loaded = [];
  for (const style of Object.values(WEIGHTS)) {
    try { await figma.loadFontAsync({ family, style }); loaded.push(style); } catch (e) { /* style missing */ }
  }
  if (loaded.includes('Regular')) return family;
  for (const style of Object.values(WEIGHTS)) await figma.loadFontAsync({ family: 'Inter', style });
  return 'Inter';
}

export function paint(ctx, token, opacity = 1) {
  const v = ctx.vars[token];
  const base = { type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 }, opacity };
  return v ? figma.variables.setBoundVariableForPaint(base, 'color', v) : base;
}

export function fill(node, ctx, token, opacity) {
  node.fills = token ? [paint(ctx, token, opacity)] : [];
}

export function stroke(node, ctx, token = 'border', weight = 1) {
  node.strokes = [paint(ctx, token)];
  node.strokeWeight = weight;
  node.strokeAlign = 'INSIDE';
}

export function round(node, ctx, size = 'lg') {
  const v = ctx.radius[size];
  if (v && typeof v === 'object') {
    for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) node.setBoundVariable(k, v);
  } else node.cornerRadius = typeof v === 'number' ? v : size === 'full' ? 999 : 8;
}

/**
 * Auto-layout frame. o: { dir: 'V'|'H', gap, pad: n | [v,h] | [t,r,b,l], fill, stroke,
 * radius, w: 'fill'|'hug'|number, h: 'fill'|'hug'|number, align, justify, wrap }
 */
export function box(ctx, name, o = {}) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = o.dir === 'H' ? 'HORIZONTAL' : 'VERTICAL';
  f.itemSpacing = o.gap ?? 0;
  const p = Array.isArray(o.pad) ? o.pad : [o.pad ?? 0];
  const [t, r = t, b = t, l = r] = p.length === 2 ? [p[0], p[1], p[0], p[1]] : p;
  Object.assign(f, { paddingTop: t, paddingRight: r, paddingBottom: b, paddingLeft: l });
  f.primaryAxisAlignItems = o.justify || 'MIN';
  f.counterAxisAlignItems = o.align || 'MIN';
  if (o.wrap) { f.layoutWrap = 'WRAP'; f.counterAxisSpacing = o.gap ?? 0; }
  fill(f, ctx, o.fill, o.fillOpacity);
  if (o.stroke) stroke(f, ctx, o.stroke === true ? 'border' : o.stroke);
  if (o.radius) round(f, ctx, o.radius);
  f.clipsContent = !!o.clip;
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  if (typeof o.w === 'number') f.resize(o.w, Math.max(1, typeof o.h === 'number' ? o.h : 1));
  if (typeof o.w === 'number') { if (f.layoutMode === 'HORIZONTAL') f.primaryAxisSizingMode = 'FIXED'; else f.counterAxisSizingMode = 'FIXED'; }
  if (typeof o.h === 'number') { if (typeof o.w !== 'number') f.resize(f.width, o.h); if (f.layoutMode === 'VERTICAL') f.primaryAxisSizingMode = 'FIXED'; else f.counterAxisSizingMode = 'FIXED'; }
  SIZING.set(f, { w: o.w, h: o.h });
  return f;
}

// Must be called after the child is appended to an auto-layout parent.
export function sizing(node, w, h) { SIZING.set(node, { w, h }); return node; }

export function size(node, w, h) {
  if (w === 'fill') node.layoutSizingHorizontal = 'FILL';
  else if (w === 'hug' && 'layoutMode' in node && node.layoutMode !== 'NONE') node.layoutSizingHorizontal = 'HUG';
  if (h === 'fill') node.layoutSizingVertical = 'FILL';
  else if (h === 'hug' && 'layoutMode' in node && node.layoutMode !== 'NONE') node.layoutSizingVertical = 'HUG';
}

export function add(parent, ...children) {
  for (const c of children.flat()) {
    if (!c) continue;
    parent.appendChild(c);
    const s = SIZING.get(c);
    if (s) size(c, s.w, s.h);
  }
  return parent;
}

// Prefers the kit's own styles (text-sm/leading-normal/medium); falls back to
// our ds/* styles on ctx.font when the kit style's font is not installed.
async function textStyle(ctx, sz, weight) {
  const key = `${sz}/${weight}`;
  if (ctx.styles[key]) return ctx.styles[key];
  if (!ctx.kitStyles) ctx.kitStyles = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
  const kit = ctx.kitStyles.get(`text-${sz}/leading-normal/${weight === 'regular' ? 'normal' : weight}`);
  if (kit) {
    try { await figma.loadFontAsync(kit.fontName); return (ctx.styles[key] = kit); } catch (e) { /* font not installed */ }
  }
  const name = `ds/${sz}/${weight}`;
  const st = ctx.kitStyles.get(name) || figma.createTextStyle();
  if (!ctx.kitStyles.has(name)) { st.name = name; ctx.kitStyles.set(name, st); }
  const [px, lh] = TYPE_SCALE[sz] || TYPE_SCALE.sm;
  st.fontName = { family: ctx.font, style: WEIGHTS[weight] || 'Regular' };
  st.fontSize = px;
  st.lineHeight = { unit: 'PIXELS', value: lh };
  st.letterSpacing = { unit: 'PERCENT', value: ['2xl', '3xl', '4xl'].includes(sz) ? -2 : 0 };
  ctx.stats.fallbackFonts = true;
  return (ctx.styles[key] = st);
}

/** o: { size: 'xs'..'4xl', weight: 'regular'|'medium'|'semibold'|'bold', color, w: 'fill', align, truncate } */
export async function text(ctx, value, o = {}) {
  const t = figma.createText();
  const st = await textStyle(ctx, o.size || 'sm', o.weight || 'regular');
  t.fontName = st.fontName;
  t.characters = String(value ?? '');
  await t.setTextStyleIdAsync(st.id);
  t.fills = [paint(ctx, o.color || 'foreground')];
  t.name = o.name || String(value).slice(0, 32);
  if (o.align) t.textAlignHorizontal = o.align;
  if (o.truncate) { t.textTruncation = 'ENDING'; t.maxLines = 1; }
  SIZING.set(t, { w: o.w });
  if (o.w === 'fill') t.textAutoResize = 'HEIGHT';
  return t;
}

export function rect(ctx, name, w, h, token, radius) {
  const r = figma.createRectangle();
  r.name = name;
  r.resize(w, h);
  fill(r, ctx, token);
  if (radius) round(r, ctx, radius);
  return r;
}

// Skeleton bar used for loading states.
export function skel(ctx, w, h = 12, radius = 'sm') {
  const r = rect(ctx, 'Skeleton', typeof w === 'number' ? w : 120, h, 'muted', radius);
  if (w === 'fill') SIZING.set(r, { w: 'fill' });
  return r;
}
