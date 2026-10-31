// Color math shared by the CLI, the plugin UI and the plugin sandbox.
// OKLCH is used for generation (perceptually even steps), hex for storage.

export function hexToRgb(hex) {
  let h = String(hex).trim().replace(/^#/, '');
  if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(h)) throw new Error(`Bad hex color: ${hex}`);
  const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
}

export function rgbToHex({ r, g, b, a = 1 }) {
  const c = (v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}${a < 1 ? c(a) : ''}`;
}

const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

export function hexToOklch(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(A * A + B * B);
  const H = C < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c: C, h: H };
}

function oklchToLinear({ l, c, h }) {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

// Reduces chroma until the color fits sRGB, keeping lightness and hue.
export function oklchToHex({ l, c, h }) {
  let lo = 0;
  let hi = c;
  let rgb = oklchToLinear({ l, c, h });
  if (!inGamut(rgb)) {
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ l, c: mid, h }))) lo = mid;
      else hi = mid;
    }
    rgb = oklchToLinear({ l, c: lo, h });
  }
  const [r, g, b] = rgb.map((v) => toGamma(Math.min(1, Math.max(0, v))));
  return rgbToHex({ r, g, b });
}

export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// Alpha colors are composited over `bg` before measuring.
export function contrast(fg, bg) {
  const over = (top, under) => {
    const t = hexToRgb(top);
    if (t.a >= 1) return top;
    const u = hexToRgb(under);
    const mix = (k) => t[k] * t.a + u[k] * (1 - t.a);
    return rgbToHex({ r: mix('r'), g: mix('g'), b: mix('b') });
  };
  const a = luminance(over(fg, bg));
  const b = luminance(over(bg, '#ffffff'));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// Picks white or near-black text for a fill, whichever reads better.
export function onColor(fill, dark = '#09090b', light = '#ffffff') {
  return contrast(light, fill) >= contrast(dark, fill) ? light : dark;
}
