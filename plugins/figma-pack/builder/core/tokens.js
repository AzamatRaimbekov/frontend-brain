// Project tokens in shadcn/ui terms: one file per project, light + dark.
// The same names become CSS variables (globals.css) and Figma variables.
import { hexToOklch, oklchToHex, contrast, onColor, hexToRgb } from './color.js';

export const COLOR_TOKENS = [
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground',
  'muted', 'muted-foreground', 'accent', 'accent-foreground',
  'destructive', 'destructive-foreground', 'border', 'input', 'ring',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground',
  'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
  // Team extension: statuses every CRM needs, shadcn has no slot for them.
  'success', 'success-foreground', 'warning', 'warning-foreground', 'info', 'info-foreground',
];

// Not in the shadcn kit's Mode collection; the Brand setup creates them.
export const EXTENSION_TOKENS = ['destructive-foreground', 'success', 'success-foreground', 'warning', 'warning-foreground', 'info', 'info-foreground'];

// What a brand overrides by default; the rest is inherited from the kit style.
export const BRAND_KEYS = [
  'primary', 'primary-foreground', 'ring', 'sidebar-primary', 'sidebar-primary-foreground', 'sidebar-ring',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  'success', 'success-foreground', 'warning', 'warning-foreground', 'info', 'info-foreground',
];

// Figma variable scopes by role, so pickers only offer sensible colors.
export function scopesFor(token) {
  const t = token.split('/').pop();
  if (/(^|-)foreground$/.test(t) || /(^|-)(txt|text)(-|$)/.test(t)) return ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR'];
  if (/^(border|input|ring|ring-offset)$|-(border|ring)$|(^|-)border-/.test(t)) return ['STROKE_COLOR', 'FRAME_FILL', 'SHAPE_FILL'];
  if (/^chart-/.test(t)) return ['SHAPE_FILL', 'FRAME_FILL', 'STROKE_COLOR'];
  return ['FRAME_FILL', 'SHAPE_FILL'];
}

// Pairs that must stay readable; checked in both modes.
export const CONTRAST_PAIRS = [
  ['foreground', 'background', 4.5], ['card-foreground', 'card', 4.5],
  ['primary-foreground', 'primary', 4.5], ['secondary-foreground', 'secondary', 4.5],
  ['muted-foreground', 'background', 4.5], ['muted-foreground', 'muted', 3],
  ['accent-foreground', 'accent', 4.5], ['destructive-foreground', 'destructive', 4.5],
  ['sidebar-foreground', 'sidebar', 4.5], ['sidebar-primary-foreground', 'sidebar-primary', 4.5],
  ['success-foreground', 'success', 4.5], ['warning-foreground', 'warning', 4.5],
  ['info-foreground', 'info', 4.5],
];

export const NEUTRALS = { neutral: [0, 0], zinc: [286, 0.006], slate: [257, 0.02], stone: [56, 0.006], gray: [264, 0.012] };
const STEPS = { 50: 0.985, 100: 0.967, 200: 0.922, 300: 0.87, 400: 0.708, 500: 0.556, 600: 0.439, 700: 0.371, 800: 0.269, 900: 0.205, 950: 0.145 };

function neutralScale(neutral, brandHue) {
  const [hue, chroma] = neutral === 'tinted' ? [brandHue, 0.012] : NEUTRALS[neutral] || NEUTRALS.neutral;
  const scale = {};
  for (const [k, l] of Object.entries(STEPS)) scale[k] = oklchToHex({ l, c: chroma, h: hue });
  return scale;
}

const shift = (hex, dl, dc = 0) => {
  const o = hexToOklch(hex);
  return oklchToHex({ l: Math.min(0.98, Math.max(0.05, o.l + dl)), c: Math.max(0, o.c + dc), h: o.h });
};

function charts(brand) {
  const { c, h } = hexToOklch(brand);
  const chroma = Math.max(0.12, Math.min(0.2, c));
  return [0, 72, 144, 216, 288].map((d, i) => oklchToHex({ l: 0.62 + (i % 2) * 0.08, c: chroma, h: (h + d) % 360 }));
}

/**
 * Generates a full token set from a brand color.
 * opts: { name, brand, neutral, radius (px), font, mono }
 */
export function generateTokens(opts = {}) {
  const brand = opts.brand || '#18181b';
  hexToRgb(brand);
  const n = neutralScale(opts.neutral || 'neutral', hexToOklch(brand).h);
  const brandDark = hexToOklch(brand).l < 0.45 ? shift(brand, 0.18) : brand;
  const status = { success: '#16a34a', warning: '#f59e0b', info: '#2563eb', destructive: '#dc2626' };
  const ch = charts(brand);
  const pair = (fill) => [fill, onColor(fill, n[950], '#ffffff')];

  const light = {
    background: '#ffffff', foreground: n[950], card: '#ffffff', 'card-foreground': n[950],
    popover: '#ffffff', 'popover-foreground': n[950],
    primary: brand, 'primary-foreground': onColor(brand, n[950], '#ffffff'),
    secondary: n[100], 'secondary-foreground': n[900], muted: n[100], 'muted-foreground': n[600],
    accent: n[100], 'accent-foreground': n[900],
    destructive: status.destructive, 'destructive-foreground': '#ffffff',
    border: n[200], input: n[200], ring: brand,
    sidebar: n[50], 'sidebar-foreground': n[950], 'sidebar-primary': brand,
    'sidebar-primary-foreground': onColor(brand, n[950], '#ffffff'),
    'sidebar-accent': n[100], 'sidebar-accent-foreground': n[900], 'sidebar-border': n[200], 'sidebar-ring': brand,
  };
  const dark = {
    background: n[950], foreground: n[50], card: n[900], 'card-foreground': n[50],
    popover: n[900], 'popover-foreground': n[50],
    primary: brandDark, 'primary-foreground': onColor(brandDark, n[950], '#ffffff'),
    secondary: n[800], 'secondary-foreground': n[50], muted: n[800], 'muted-foreground': n[400],
    accent: n[800], 'accent-foreground': n[50],
    destructive: '#dc2626', 'destructive-foreground': '#ffffff',
    border: n[800], input: n[800], ring: brandDark,
    sidebar: n[900], 'sidebar-foreground': n[50], 'sidebar-primary': brandDark,
    'sidebar-primary-foreground': onColor(brandDark, n[950], '#ffffff'),
    'sidebar-accent': n[800], 'sidebar-accent-foreground': n[50], 'sidebar-border': n[800], 'sidebar-ring': brandDark,
  };
  for (const [k, v] of Object.entries({ success: status.success, warning: status.warning, info: status.info })) {
    [light[k], light[`${k}-foreground`]] = pair(v);
    [dark[k], dark[`${k}-foreground`]] = pair(shift(v, 0.06));
  }
  ch.forEach((c, i) => { light[`chart-${i + 1}`] = c; dark[`chart-${i + 1}`] = shift(c, 0.05); });

  return {
    $schema: 'ds-builder/tokens@1',
    name: opts.name || 'project',
    source: { brand, neutral: opts.neutral || 'neutral' },
    font: { sans: opts.font || 'Inter', mono: opts.mono || 'JetBrains Mono' },
    radius: Number(opts.radius ?? 10),
    colors: { light, dark },
  };
}

// shadcn derives the radius scale from one --radius value.
export function radiusScale(radius) {
  const r = Number(radius);
  return { sm: Math.max(0, r - 4), md: Math.max(0, r - 2), lg: r, xl: r + 4 };
}

export const SPACING = { 0: 0, 0.5: 2, 1: 4, 1.5: 6, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 };

export const TYPE_SCALE = {
  xs: [12, 16], sm: [14, 20], base: [16, 24], lg: [18, 28], xl: [20, 28], '2xl': [24, 32], '3xl': [30, 36], '4xl': [36, 40],
};

export function validateTokens(t) {
  const errors = [];
  if (!t || typeof t !== 'object') return ['tokens: not an object'];
  if (!t.name) errors.push('name: required');
  if (!(Number(t.radius) >= 0)) errors.push('radius: must be a number of px');
  for (const mode of ['light', 'dark']) {
    const set = t.colors?.[mode];
    if (!set) { errors.push(`colors.${mode}: missing`); continue; }
    for (const k of COLOR_TOKENS) {
      if (!set[k]) errors.push(`colors.${mode}.${k}: missing`);
      else try { hexToRgb(set[k]); } catch { errors.push(`colors.${mode}.${k}: bad hex ${set[k]}`); }
    }
    for (const k of Object.keys(set)) if (!COLOR_TOKENS.includes(k)) errors.push(`colors.${mode}.${k}: unknown token`);
  }
  return errors;
}

export function contrastReport(t) {
  const out = [];
  for (const mode of ['light', 'dark']) {
    const set = t.colors[mode];
    for (const [fg, bg, min] of CONTRAST_PAIRS) {
      const ratio = contrast(set[fg], set[bg]);
      out.push({ mode, fg, bg, ratio: Math.round(ratio * 100) / 100, min, ok: ratio >= min });
    }
  }
  return out;
}

// Applies user overrides ({ light: {primary: '#..'}, dark: {...} }) and re-derives
// foregrounds that were not overridden, so a single color edit stays readable.
export function withOverrides(t, overrides = {}) {
  const next = JSON.parse(JSON.stringify(t));
  for (const mode of ['light', 'dark']) {
    const o = overrides[mode] || {};
    Object.assign(next.colors[mode], o);
    for (const k of Object.keys(o)) {
      const fgKey = `${k}-foreground`;
      if (COLOR_TOKENS.includes(fgKey) && !o[fgKey] && !['background', 'card', 'popover', 'sidebar'].includes(k)) {
        next.colors[mode][fgKey] = onColor(o[k]);
      }
    }
  }
  return next;
}
