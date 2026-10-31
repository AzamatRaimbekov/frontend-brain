// Colour math COPIED from plugins/figma-pack/builder/core/color.js (same repo, MIT) and typed.
// Copied, not imported: apps must not depend on plugin files at runtime. Keep in sync by hand.
// Added here: parseCssColor (hex, oklch(), rgb()) for shadcn oklch themes and Figma export.

export type Rgba = { r: number; g: number; b: number; a: number }

export function hexToRgb(hex: string): Rgba {
  let h = String(hex).trim().replace(/^#/, "")
  if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("")
  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(h)) throw new Error(`Bad hex color: ${hex}`)
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16) / 255
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 }
}

export function rgbToHex({ r, g, b, a = 1 }: { r: number; g: number; b: number; a?: number }) {
  const c = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")
  return `#${c(r)}${c(g)}${c(b)}${a < 1 ? c(a) : ""}`
}

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)

function oklchToLinear({ l, c, h }: { l: number; c: number; h: number }) {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
}

const inGamut = (rgb: number[]) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4)

// Reduces chroma until the color fits sRGB, keeping lightness and hue.
export function oklchToHex({ l, c, h, a = 1 }: { l: number; c: number; h: number; a?: number }) {
  let lo = 0
  let hi = c
  let rgb = oklchToLinear({ l, c, h })
  if (!inGamut(rgb)) {
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (inGamut(oklchToLinear({ l, c: mid, h }))) lo = mid
      else hi = mid
    }
    rgb = oklchToLinear({ l, c: lo, h })
  }
  const [r, g, b] = rgb.map((v) => toGamma(Math.min(1, Math.max(0, v))))
  return rgbToHex({ r, g, b, a })
}

export function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

// Alpha colors are composited over `bg` before measuring.
export function contrast(fg: string, bg: string) {
  const over = (top: string, under: string) => {
    const t = hexToRgb(top)
    if (t.a >= 1) return top
    const u = hexToRgb(under)
    const mix = (k: "r" | "g" | "b") => t[k] * t.a + u[k] * (1 - t.a)
    return rgbToHex({ r: mix("r"), g: mix("g"), b: mix("b") })
  }
  const a = luminance(over(fg, bg))
  const b = luminance(over(bg, "#ffffff"))
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

// ---- added for the configurator ----

const num = (s: string, scale = 1) => (s.endsWith("%") ? parseFloat(s) / 100 : parseFloat(s) / scale)

/** A CSS colour (hex, oklch(), rgb()/rgba()) -> #rrggbb[aa], or null when it is not a colour. */
export function parseCssColor(value: string): string | null {
  const v = value.trim().toLowerCase()
  if (v.startsWith("#")) {
    try {
      return rgbToHex(hexToRgb(v))
    } catch {
      return null
    }
  }
  const fn = /^(oklch|rgba?)\(([^)]+)\)$/.exec(v)
  if (!fn) return null
  const [main, alpha] = fn[2].split("/").map((s) => s.trim())
  const parts = main.split(/[\s,]+/).filter(Boolean)
  const rest = fn[1] === "rgba" && !alpha && parts.length === 4 ? parts.pop() : undefined
  const a = alpha ?? rest ? num((alpha ?? rest) as string) : 1
  if (parts.length !== 3 || parts.some((p) => Number.isNaN(parseFloat(p)))) return null
  if (fn[1] === "oklch") {
    return oklchToHex({ l: num(parts[0]), c: parseFloat(parts[1]), h: parseFloat(parts[2]), a })
  }
  return rgbToHex({ r: num(parts[0], 255), g: num(parts[1], 255), b: num(parts[2], 255), a })
}

/** Follows `var(--x)` through `vars` (one mode) to a final value; null on a cycle or a missing var. */
export function resolveVar(value: string, vars: Record<string, string>, depth = 0): string | null {
  const m = /^var\(--([\w-]+)\)$/.exec(value.trim())
  if (!m) return value
  if (depth > 10 || !(m[1] in vars)) return null
  return resolveVar(vars[m[1]], vars, depth + 1)
}
