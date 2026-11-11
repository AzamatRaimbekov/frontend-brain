// Colour math of the widget: CSS colour strings (oklch() as shadcn writes them, #hex) <-> Figma RGBA
// (sRGB channels 0..1). OKLab <-> linear sRGB with Björn Ottosson's matrices (CSS Color 4), sRGB transfer
// function, alpha kept (`oklch(1 0 0 / 10%)` -> a 0.1). Out-of-gamut channels are clipped to 0..1.
// Pure: runs in node:test, in the widget sandbox and in the iframe.

const NUM = '[+-]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[+-]?\\d+)?';
const OKLCH = new RegExp(`^oklch\\(\\s*(${NUM})(%?)\\s+(${NUM})(%?)\\s+(${NUM}|none)(?:deg)?\\s*(?:\\/\\s*(${NUM})(%?)\\s*)?\\)$`, 'i');
const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

// Clipped to 0..1; float noise of the matrices next to 0 or 1 snaps (oklch(1 0 0) is exactly white).
const clamp01 = (x) => (x > 1 - 1e-7 ? 1 : x < 1e-7 ? 0 : x);
const toLinear = (x) => (Math.abs(x) <= 0.04045 ? x / 12.92 : Math.sign(x) * ((Math.abs(x) + 0.055) / 1.055) ** 2.4);
const toGamma = (x) => (Math.abs(x) <= 0.0031308 ? 12.92 * x : Math.sign(x) * (1.055 * Math.abs(x) ** (1 / 2.4) - 0.055));

/** "oklch(0.577 0.245 27.325 / 50%)" -> { l, c, h, alpha }; null when not oklch(). */
export function parseOklch(text) {
  const m = OKLCH.exec(String(text == null ? '' : text).trim());
  if (!m) return null;
  const l = Number(m[1]) / (m[2] ? 100 : 1);
  const c = Number(m[3]) * (m[4] ? 0.4 / 100 : 1); // CSS: 100% chroma = 0.4
  const h = m[5].toLowerCase() === 'none' ? 0 : Number(m[5]);
  const alpha = m[6] === undefined ? 1 : Number(m[6]) / (m[7] ? 100 : 1);
  if (![l, c, h, alpha].every(Number.isFinite)) return null;
  return { l, c: Math.max(0, c), h, alpha: clamp01(alpha) };
}

/** OKLCH -> unclipped sRGB (gamma-encoded) { r, g, b }. */
export function oklchToSrgb({ l, c, h }) {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: toGamma(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    g: toGamma(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    b: toGamma(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  };
}

/** sRGB { r, g, b } (0..1) -> { l, c, h }. */
export function srgbToOklch({ r, g, b }) {
  const [R, G, B] = [r, g, b].map(toLinear);
  const l_ = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m_ = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s_ = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const Bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.sqrt(A * A + Bb * Bb);
  let h = (Math.atan2(Bb, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

/** Any supported CSS colour (oklch(), #rgb[a], #rrggbb[aa]) -> Figma RGBA { r, g, b, a }; null otherwise. */
export function parseColor(text) {
  const s = String(text == null ? '' : text).trim();
  const ok = parseOklch(s);
  if (ok) {
    const { r, g, b } = oklchToSrgb(ok);
    return { r: clamp01(r), g: clamp01(g), b: clamp01(b), a: ok.alpha };
  }
  const m = HEX.exec(s);
  if (!m) return null;
  let h = m[1].toLowerCase();
  if (h.length <= 4) h = [...h].map((ch) => ch + ch).join('');
  const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
}

/** True when the colour fits sRGB without clipping (tolerance of half an 8-bit step). */
export function inGamut(text) {
  const ok = parseOklch(text);
  if (!ok) return parseColor(text) !== null;
  const eps = 0.5 / 255;
  return Object.values(oklchToSrgb(ok)).every((x) => x >= -eps && x <= 1 + eps);
}

const byte = (x) => Math.round(clamp01(x) * 255).toString(16).padStart(2, '0');

/** Figma RGBA -> "#rrggbb" or "#rrggbbaa" (alpha < 1). */
export function rgbaToHex(c) {
  if (!c) return null;
  const a = c.a === undefined ? 1 : c.a;
  return `#${byte(c.r)}${byte(c.g)}${byte(c.b)}${a >= 1 ? '' : byte(a)}`;
}

/** Comparable key of a colour value (CSS string or Figma RGBA): 8-bit "#rrggbb[aa]"; null when not a colour. */
export function colorKey(value) {
  if (value && typeof value === 'object' && 'r' in value) return rgbaToHex(value);
  const c = parseColor(value);
  return c ? rgbaToHex(c) : null;
}

const num = (x, digits) => String(Number(x.toFixed(digits)));

/**
 * Figma RGBA -> "oklch(L C H)" / "oklch(L C H / A%)" the way shadcn writes it (3 decimals, achromatic:
 * C = H = 0). More decimals only when 3 would not give back the same 8-bit colour.
 */
export function rgbaToOklch(c) {
  const { l, c: chroma, h } = srgbToOklch(c);
  const a = c.a === undefined ? 1 : c.a;
  const alpha = a >= 1 ? '' : ` / ${num(a * 100, 1)}%`;
  const want = rgbaToHex(c);
  let out = '';
  for (const d of [3, 4, 5, 6]) {
    const grey = Number(chroma.toFixed(d)) === 0;
    out = `oklch(${num(l, d)} ${grey ? '0' : num(chroma, d)} ${grey ? '0' : num(h, 3)}${alpha})`;
    if (colorKey(out) === want) break;
  }
  return out;
}

const luminance = ({ r, g, b }) => {
  const [R, G, B] = [r, g, b].map((x) => toLinear(clamp01(x)));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

/** `fg` over `bg` (alpha composited onto `bg`, `bg` onto `base` when translucent) as opaque RGB. */
export function composite(fg, bg) {
  const a = fg.a === undefined ? 1 : fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

/** WCAG 2 contrast ratio of two opaque Figma RGBA colours. */
export function contrastRatio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
