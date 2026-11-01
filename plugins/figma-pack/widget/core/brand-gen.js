// One brand colour -> the 12 Mbank brand slots (1.brand light + 2.theme brand/<product>/* dark).
// Base colours come from the DS Builder generator (core/tokens.js generateTokens: primary,
// primary-foreground in light and dark); states and ghost tints are OKLCH steps of the same hue.
import { generateTokens } from '../../builder/core/tokens.js';
import { hexToOklch, oklchToHex, contrast, hexToRgb } from '../../builder/core/color.js';

export const BRAND_SLOTS = [
  'default', 'hover', 'active', 'on-accent', 'on-accent-muted', 'container-muted',
  'ghost-default', 'ghost-hover', 'ghost-active', 'ghost-on-accent', 'ghost-on-accent-muted', 'ghost-container-muted',
];

const step = (hex, dl) => {
  const o = hexToOklch(hex);
  return oklchToHex({ l: Math.min(0.98, Math.max(0.05, o.l + dl)), c: o.c, h: o.h });
};
const tint = (hex, l, maxC) => {
  const o = hexToOklch(hex);
  return oklchToHex({ l, c: Math.min(o.c, maxC), h: o.h });
};
const mix = (a, b, t) => {
  const x = hexToOklch(a);
  const y = hexToOklch(b);
  return oklchToHex({ l: x.l + (y.l - x.l) * t, c: x.c + (y.c - x.c) * t, h: y.c < 0.02 ? x.h : y.h });
};
const alpha = (hex, a) => `${hex.slice(0, 7)}${Math.round(a * 255).toString(16).padStart(2, '0')}`;

// Darkens (light theme) or lightens (dark theme) a text colour until it reads on the fill.
function readable(fg, bg, min = 4.5, dir = -1) {
  let out = fg;
  for (let i = 0; i < 20 && contrast(out, bg) < min; i++) out = step(out, dir * 0.03);
  return out;
}

/** hex -> { light: { default, hover, ... }, dark: { ... } } for the 12 brand slots. */
export function generateBrand(hex) {
  hexToRgb(hex); // throws on a bad colour
  const t = generateTokens({ brand: hex });
  const base = t.colors.light.primary;
  const baseDark = t.colors.dark.primary;
  const lightGhost = tint(base, 0.97, 0.04);
  const light = {
    default: base,
    hover: step(base, -0.05),
    active: step(base, -0.08),
    'on-accent': t.colors.light['primary-foreground'],
    'on-accent-muted': mix(t.colors.light['primary-foreground'], base, 0.35),
    'container-muted': tint(base, 0.95, 0.01),
    'ghost-default': lightGhost,
    'ghost-hover': tint(base, 0.94, 0.06),
    'ghost-active': lightGhost,
    'ghost-on-accent': readable(base, lightGhost),
    'ghost-on-accent-muted': tint(base, 0.85, 0.12),
    'ghost-container-muted': lightGhost,
  };
  const dark = {
    default: baseDark,
    hover: step(baseDark, 0.05),
    active: baseDark,
    'on-accent': t.colors.dark['primary-foreground'],
    'on-accent-muted': mix(t.colors.dark['primary-foreground'], baseDark, 0.35),
    'container-muted': tint(baseDark, 0.32, 0.01),
    'ghost-default': alpha(baseDark, 0.1),
    'ghost-hover': alpha(baseDark, 0.15),
    'ghost-active': alpha(baseDark, 0.1),
    'ghost-on-accent': baseDark,
    'ghost-on-accent-muted': alpha(baseDark, 0.1),
    'ghost-container-muted': alpha(baseDark, 0.1),
  };
  return { light, dark };
}

/** Brand slots -> board edits for one brand: { 'kassa:brand': { light, dark }, ... }. */
export function brandEdits(rows, brand, generated) {
  const edits = {};
  for (const r of rows) {
    if (r.group !== 'brand' || r.collection !== '1.brand' || r.kind !== 'color') continue;
    const slot = r.figma.replace(/^brand\//, '');
    if (!(slot in generated.light)) continue;
    edits[`${brand}:${r.css}`] = { light: generated.light[slot], dark: generated.dark[slot] };
  }
  return edits;
}
