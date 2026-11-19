// The one token set of the design system: standard shadcn/ui (31 colours light/dark, radius, two
// font vars). Values come from src/data/shadcn-tokens.json, the app's copy of the canonical file
// owned by plugins/figma-pack/skills/ds-tokens/references/shadcn-tokens.json. A project changes only
// the values of these names (overrides); there are no other tokens.
import canonical from "@/data/shadcn-tokens.json"

import { parseCssColor, resolveVar } from "./color"
import type { ModeVars } from "./types"

export type Mode = "light" | "dark"
export type TokenKind = "color" | "radius" | "font"
export type Override = { light?: string; dark?: string }
export type Overrides = Record<string, Override>

export type TokenValues = {
  radius: string
  font: { sans: string; heading: string }
  colors: Record<string, { light: string; dark: string }>
}

export const SHADCN_TOKENS: TokenValues = {
  radius: canonical.radius,
  font: { ...canonical.font },
  colors: Object.fromEntries(Object.entries(canonical.colors).map(([k, v]) => [k, { ...v }])),
}

/** The 31 colour names in canonical order. */
export const COLOR_NAMES = Object.keys(canonical.colors)
/** radius-sm..4xl: derived from --radius, not editable. */
export const RADIUS_SCALE: Record<string, string> = { ...canonical.radiusScale }
export const FONT_NAMES = ["font-sans", "font-heading"] as const

/** Every editable name -> kind. Single-value kinds (radius, font) use only the light value. */
export const EDITABLE: ReadonlyMap<string, TokenKind> = new Map<string, TokenKind>([
  ...COLOR_NAMES.map((n) => [n, "color"] as [string, TokenKind]),
  ["radius", "radius"],
  ["font-sans", "font"],
  ["font-heading", "font"],
])

export const singleValue = (kind: TokenKind) => kind !== "color"

/** Base value of an editable name in one mode. */
export function valueOf(values: TokenValues, name: string, mode: Mode): string {
  if (name === "radius") return values.radius
  if (name === "font-sans") return values.font.sans
  if (name === "font-heading") return values.font.heading
  return values.colors[name][mode]
}

/** Base values with a project's overrides applied (unknown names are ignored). */
export function applyOverrides(base: TokenValues, overrides: Overrides): TokenValues {
  const out: TokenValues = { radius: base.radius, font: { ...base.font }, colors: {} }
  for (const [name, v] of Object.entries(base.colors)) out.colors[name] = { ...v, ...pick(overrides[name]) }
  if (overrides.radius?.light) out.radius = overrides.radius.light
  if (overrides["font-sans"]?.light) out.font.sans = overrides["font-sans"].light
  if (overrides["font-heading"]?.light) out.font.heading = overrides["font-heading"].light
  return out
}

const pick = (o: Override | undefined) => ({ ...(o?.light && { light: o.light }), ...(o?.dark && { dark: o.dark }) })

/** :root / .dark / @theme inline vars of a token set (keys without "--"). */
export function toVars(values: TokenValues) {
  const light: ModeVars = { radius: values.radius }
  const dark: ModeVars = {}
  for (const [name, v] of Object.entries(values.colors)) {
    light[name] = v.light
    dark[name] = v.dark
  }
  const theme: ModeVars = { "font-sans": values.font.sans, "font-heading": values.font.heading }
  for (const [k, v] of Object.entries(RADIUS_SCALE)) theme[`radius-${k}`] = v
  return { light, dark, theme }
}

export const toPx = (value: string) => (value.endsWith("rem") ? parseFloat(value) * 16 : parseFloat(value))

/** px of `--radius` and of every derived radius (calc(var(--radius) * k) or var(--radius)). */
export function radiusPx(values: TokenValues): Record<string, number | null> {
  const r = /^(0|\d+(\.\d+)?(px|rem))$/.test(values.radius) ? toPx(values.radius) : null
  const out: Record<string, number | null> = { radius: r }
  for (const [k, v] of Object.entries(RADIUS_SCALE)) {
    const m = /^calc\(var\(--radius\) \* ([\d.]+)\)$/.exec(v)
    out[`radius-${k}`] = r === null ? null : v === "var(--radius)" ? r : m ? Math.round(r * parseFloat(m[1]) * 100) / 100 : null
  }
  return out
}

/** Final #hex of a colour token in one mode (follows var() inside the colour set), or null. */
export function colorHex(values: TokenValues, name: string, mode: Mode): string | null {
  const vars = Object.fromEntries(Object.entries(values.colors).map(([k, v]) => [k, v[mode]]))
  const v = name in vars ? resolveVar(vars[name], vars) : null
  return v === null ? null : parseCssColor(v)
}

/** First family of a CSS font-family list, without quotes and fontsource's " Variable" suffix. */
export function fontFamily(stack: string): string {
  const first = stack.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "") ?? ""
  return first.replace(/ Variable$/, "")
}
