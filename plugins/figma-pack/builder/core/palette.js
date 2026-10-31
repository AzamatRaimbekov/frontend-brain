// Snaps generated colors to the kit's Tailwind primitives, so a brand reads
// "primary -> amber/400" instead of a loose hex.
import { hexToOklch, hexToRgb } from './color.js';

function lab(hex) {
  const { l, c, h } = hexToOklch(hex);
  const r = (h * Math.PI) / 180;
  return [l, c * Math.cos(r), c * Math.sin(r)];
}

// Distance in OKLab x100: ~1 is barely visible, ~3 is a clear difference.
export function deltaE(a, b) {
  const [l1, a1, b1] = lab(a);
  const [l2, a2, b2] = lab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2) * 100;
}

/**
 * palette: { 'amber/400': '#fcbb00', ... }. Returns { name, hex, de } of the
 * nearest opaque primitive, or null when nothing is within maxDE.
 */
export function snap(hex, palette, maxDE = 2.5) {
  if (hexToRgb(hex).a < 1) return null;
  let best = null;
  for (const [name, value] of Object.entries(palette)) {
    if (hexToRgb(value).a < 1) continue;
    const de = deltaE(hex, value);
    if (!best || de < best.de) best = { name, hex: value, de };
  }
  return best && best.de <= maxDE ? best : null;
}
