// Colours of the widget itself come from the bundled shadcn tokens (light mode of the source), so the
// board and the iframe never carry their own colour values.
import { parseColor, rgbaToHex } from '../core/oklch.js';

// Chrome role -> shadcn token.
const ROLES = {
  page: 'background', card: 'card', soft: 'muted', text: 'foreground', muted: 'muted-foreground', border: 'border',
  primary: 'primary', onPrimary: 'primary-foreground', accentSoft: 'accent', accentText: 'accent-foreground',
  successBg: 'secondary', successFg: 'secondary-foreground',
  warningBg: 'accent', warningFg: 'destructive',
  errorBg: 'destructive', errorFg: 'primary-foreground',
  neutralBg: 'muted', neutralFg: 'muted-foreground',
  infoBg: 'secondary', infoFg: 'foreground',
};

export const paint = (value) => parseColor(value) || { r: 0, g: 0, b: 0, a: 0 };

/** { role: css colour } from the source tokens (light mode). */
export function chromeColors(tokens) {
  const out = {};
  for (const [role, name] of Object.entries(ROLES)) out[role] = (tokens.colors[name] && tokens.colors[name].light) || null;
  return out;
}

/** Same roles as widget paints ({ r, g, b, a }). */
export function chrome(tokens) {
  const out = {};
  for (const [role, value] of Object.entries(chromeColors(tokens))) out[role] = paint(value);
  return out;
}

/** :root { --page: #...; } for the iframe, built at bundle time from the same roles. */
export function chromeCss(tokens) {
  return `:root{${Object.entries(chromeColors(tokens)).map(([k, v]) => `--${k}:${rgbaToHex(paint(v))}`).join(';')}}`;
}

export const TONES = {
  success: ['successBg', 'successFg'], warning: ['warningBg', 'warningFg'], error: ['errorBg', 'errorFg'],
  neutral: ['neutralBg', 'neutralFg'], info: ['infoBg', 'infoFg'], brand: ['accentSoft', 'accentText'],
};
