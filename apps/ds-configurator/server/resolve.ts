// A project = base tokens of its brand + overrides + custom tokens. Resolves them into rows (the
// site table, the Figma plan and the contrast check read these) with plain values per mode.
import { contrast, parseCssColor, resolveVar } from "@/lib/color"
import { MIN_TEXT_CONTRAST, toPx } from "@/lib/extra-tokens"
import type { ModeVars } from "@/lib/types"

import { baseTokens, type BaseSource, type BaseToken, type Mode, type TokenKind, type ValueSource } from "./base"
import type { TokensDoc } from "./store"

export type Row = {
  name: string
  kind: TokenKind
  scope: "root" | "theme"
  custom: boolean
  light: string
  dark: string
  /** Base values and provenance; null for custom tokens. */
  base: { light: string; dark: string; source: Record<Mode, ValueSource>; resolved: Record<Mode, string | number | null> } | null
  overridden: Record<Mode, boolean>
  /** Final colour (#hex) or px number per mode; null when a var chain is broken. */
  resolved: Record<Mode, string | number | null>
  pairWith?: string
}

export type Resolved = { rows: Row[]; light: ModeVars; dark: ModeVars; base: BaseToken[] }

const plain = (kind: TokenKind, value: string | null) => {
  if (value === null) return null
  if (kind === "color") return parseCssColor(value)
  return /^\d+(\.\d+)?(px|rem)$|^0$/.test(value) ? toPx(value) : null
}

export function resolveProject(source: BaseSource, doc: TokensDoc): Resolved {
  const base = baseTokens(source, doc.brand)
  const rows: Row[] = base.map((t) => {
    const o = doc.overrides[t.name] ?? {}
    return {
      name: t.name, kind: t.kind, scope: t.scope, custom: false,
      light: o.light ?? t.light, dark: o.dark ?? t.dark,
      base: { light: t.light, dark: t.dark, source: t.source, resolved: { light: null, dark: null } },
      overridden: { light: o.light !== undefined, dark: o.dark !== undefined },
      resolved: { light: null, dark: null },
    }
  })
  for (const x of doc.custom) {
    rows.push({
      name: x.name, kind: x.kind, scope: "root", custom: true, light: x.light, dark: x.dark || x.light,
      base: null, overridden: { light: false, dark: false }, resolved: { light: null, dark: null },
      ...(x.pairWith && { pairWith: x.pairWith }),
    })
  }
  const light: ModeVars = Object.fromEntries(rows.map((r) => [r.name, r.light]))
  const dark: ModeVars = Object.fromEntries(rows.map((r) => [r.name, r.dark]))
  const baseLight: ModeVars = Object.fromEntries(base.map((t) => [t.name, t.light]))
  const baseDark: ModeVars = Object.fromEntries(base.map((t) => [t.name, t.dark]))
  for (const r of rows) {
    if (r.base) r.base.resolved = { light: plain(r.kind, resolveVar(r.base.light, baseLight)), dark: plain(r.kind, resolveVar(r.base.dark, baseDark)) }
    r.resolved = { light: plain(r.kind, resolveVar(r.light, light)), dark: plain(r.kind, resolveVar(r.dark, dark)) }
  }
  return { rows, light, dark, base }
}

export type ContrastCheck = { fg: string; bg: string; mode: Mode; ratio: number | null; ok: boolean }

/** WCAG AA of text tokens on their fill: X-foreground on X, foreground on background, custom pairWith. */
export function contrastChecks(rows: Row[]): ContrastCheck[] {
  const colors = new Map(rows.filter((r) => r.kind === "color").map((r) => [r.name, r]))
  const pairs: [string, string][] = []
  for (const r of colors.values()) {
    const bg = r.pairWith ?? (r.name === "foreground" ? "background" : r.name.endsWith("-foreground") ? r.name.slice(0, -11) : null)
    if (bg && colors.has(bg)) pairs.push([r.name, bg])
  }
  const out: ContrastCheck[] = []
  for (const [fg, bg] of pairs) {
    for (const mode of ["light", "dark"] as const) {
      const a = colors.get(fg)?.resolved[mode]
      const b = colors.get(bg)?.resolved[mode]
      const ratio = typeof a === "string" && typeof b === "string" ? Math.round(contrast(a, b) * 100) / 100 : null
      out.push({ fg, bg, mode, ratio, ok: ratio !== null && ratio >= MIN_TEXT_CONTRAST })
    }
  }
  return out
}
