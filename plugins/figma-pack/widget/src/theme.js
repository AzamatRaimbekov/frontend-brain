// Colours of the widget itself come from the bundled Mbank tokens (light theme of the source), so
// the board and the iframe never carry their own hex values.
import { hexToRgb } from '../../builder/core/color.js';
import { buildModel } from '../core/model.js';

export const paint = (hex) => {
  try { const { r, g, b, a } = hexToRgb(hex); return { r, g, b, a }; } catch (e) { return { r: 0, g: 0, b: 0, a: 0 }; }
};

// Chrome role -> CSS token of the Mbank map.
const ROLES = {
  page: 'background', card: 'card', soft: 'muted', text: 'foreground', muted: 'muted-foreground', border: 'border',
  brand: 'brand', onBrand: 'brand-foreground', accentSoft: 'brand-ghost', accentText: 'brand-ghost-foreground',
  successBg: 'status-success-muted', successFg: 'status-success-foreground',
  warningBg: 'status-warning-muted', warningFg: 'status-warning-foreground',
  errorBg: 'status-error-muted', errorFg: 'status-error-foreground',
  neutralBg: 'status-neutral-muted', neutralFg: 'status-neutral-foreground',
  infoBg: 'status-info-muted', infoFg: 'status-info-foreground',
};

/** { role: '#hex' } from the source tokens for one brand (light theme). */
export function chromeHex(tokens, brand = 'bank') {
  const byCss = new Map(buildModel(tokens, { brand }).rows.map((r) => [r.css, r]));
  const out = {};
  for (const [role, css] of Object.entries(ROLES)) out[role] = (byCss.get(css) && byCss.get(css).source.light) || null;
  return out;
}

/** Same roles as widget paints ({ r, g, b, a }). */
export function chrome(tokens, brand) {
  const hex = chromeHex(tokens, brand);
  const out = {};
  for (const [role, value] of Object.entries(hex)) out[role] = paint(value);
  return out;
}

/** :root { --page: ...; } for the iframe, built at bundle time from the same roles. */
export function chromeCss(tokens) {
  const hex = chromeHex(tokens);
  return `:root{${Object.entries(hex).map(([k, v]) => `--${k}:${v}`).join(';')}}`;
}

export const TONES = {
  success: ['successBg', 'successFg'], warning: ['warningBg', 'warningFg'], error: ['errorBg', 'errorFg'],
  neutral: ['neutralBg', 'neutralFg'], info: ['infoBg', 'infoFg'], brand: ['accentSoft', 'accentText'],
};
