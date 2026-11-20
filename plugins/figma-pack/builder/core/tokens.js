// The design system's only tokens: standard shadcn/ui (Tailwind v4, oklch), light + dark.
// Source of truth: figma-pack skills/ds-tokens/references/shadcn-tokens.json (schema shadcn/tokens@1),
// bundled at build time. The same names are CSS variables (globals.css) and Figma variables
// (collection «shadcn», modes Light/Dark). A project changes values only, never adds names.
import CANON from '../../skills/ds-tokens/references/shadcn-tokens.json' with { type: 'json' };
import { oklchToRgba, rgbToHex, contrast } from './color.js';

export const SHADCN_TOKENS = CANON;
export const COLLECTION = 'shadcn';
export const THEMES = ['light', 'dark'];
export const COLOR_TOKENS = Object.keys(CANON.colors);

const REM = 16;
const remToPx = (s) => (String(s).endsWith('rem') ? parseFloat(s) * REM : parseFloat(s));

/** --radius in px (0.625rem = 10). */
export const RADIUS = remToPx(CANON.radius);

// "calc(var(--radius) * 0.6)" / "var(--radius)" -> px from a base radius.
const factor = (expr) => { const m = /\*\s*([\d.]+)/.exec(expr); return m ? parseFloat(m[1]) : 1; };

/** Radius scale in px: { sm: 6, md: 8, lg: 10, xl: 14, 2xl: 18, 3xl: 22, 4xl: 26 } for the canonical 10 px. */
export function radiusScale(radius = RADIUS) {
  const r = Number(radius);
  const out = {};
  // A step is either a fixed length (Figma radius/*: "8px", "0.5rem") or a formula of --radius.
  for (const [k, expr] of Object.entries(CANON.radiusScale)) {
    out[k] = /^[\d.]+(px|rem)$/.test(String(expr).trim()) ? remToPx(expr) : Math.round(r * factor(expr) * 100) / 100;
  }
  return out;
}
export const RADIUS_KEYS = Object.keys(CANON.radiusScale);

/** Figma variable names for radius: «radius» and «radius-<key>», like the CSS variables. */
export const RADIUS_TOKENS = ['radius', ...RADIUS_KEYS.map((k) => `radius-${k}`)];

/** Canonical colour as Figma RGBA. */
export const rgbaOf = (token, theme) => oklchToRgba(CANON.colors[token][theme]);

/** Canonical colour as #rrggbb[aa] (for previews and contrast checks). */
export const hexOf = (token, theme) => rgbToHex(rgbaOf(token, theme));

// Figma variable scopes by role, the same set as the widget (widget/core/sync.js scopesOf): both write
// the shadcn collection and must not overwrite each other.
const FILLS = ['FRAME_FILL', 'SHAPE_FILL'];
export function scopesFor(token) {
  if (/-foreground$/.test(token)) return ['TEXT_FILL'];
  if (/^(sidebar-)?(border|ring)$/.test(token)) return ['STROKE_COLOR'];
  if (token === 'input') return ['STROKE_COLOR', ...FILLS];
  if (/^(destructive|success|warning|info)$/.test(token)) return [...FILLS, 'TEXT_FILL', 'STROKE_COLOR'];
  if (/^chart-/.test(token)) return [...FILLS, 'STROKE_COLOR'];
  return [...FILLS];
}

// Pairs that must stay readable; checked in both modes.
export const CONTRAST_PAIRS = [
  ['foreground', 'background', 4.5], ['card-foreground', 'card', 4.5], ['popover-foreground', 'popover', 4.5],
  ['primary-foreground', 'primary', 4.5], ['secondary-foreground', 'secondary', 4.5],
  ['muted-foreground', 'background', 4.5], ['muted-foreground', 'muted', 3],
  ['accent-foreground', 'accent', 4.5], ['sidebar-foreground', 'sidebar', 4.5],
  ['sidebar-primary-foreground', 'sidebar-primary', 4.5], ['sidebar-accent-foreground', 'sidebar-accent', 4.5],
];

/**
 * tokens: the canonical shape ({ colors: { name: { light, dark } } }, values oklch() or hex).
 * Returns every contrast pair per theme.
 */
export function contrastReport(tokens = CANON) {
  const hex = (v) => (String(v).startsWith('#') ? v : rgbToHex(oklchToRgba(v)));
  const out = [];
  for (const mode of THEMES) {
    for (const [fg, bg, min] of CONTRAST_PAIRS) {
      const ratio = contrast(hex(tokens.colors[fg][mode]), hex(tokens.colors[bg][mode]));
      out.push({ mode, fg, bg, ratio: Math.round(ratio * 100) / 100, min, ok: ratio >= min });
    }
  }
  return out;
}

/** Errors of a tokens file in the canonical shape: exactly the shadcn names, both themes, parseable values. */
export function validateTokens(t) {
  const errors = [];
  if (!t || typeof t !== 'object' || !t.colors) return ['tokens: no colors'];
  for (const k of COLOR_TOKENS) {
    for (const mode of THEMES) {
      const v = t.colors[k] && t.colors[k][mode];
      if (!v) { errors.push(`colors.${k}.${mode}: missing`); continue; }
      try { if (!String(v).startsWith('#')) oklchToRgba(v); } catch { errors.push(`colors.${k}.${mode}: bad value ${v}`); }
    }
  }
  for (const k of Object.keys(t.colors)) if (!COLOR_TOKENS.includes(k)) errors.push(`colors.${k}: not a shadcn token`);
  return errors;
}

export const SPACING = { 0: 0, 0.5: 2, 1: 4, 1.5: 6, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 };

export const TYPE_SCALE = {
  xs: [12, 16], sm: [14, 20], base: [16, 24], lg: [18, 28], xl: [20, 28], '2xl': [24, 32], '3xl': [30, 36], '4xl': [36, 40],
};
