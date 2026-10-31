// Extra project tokens: validation and the WCAG AA contrast check for text/fill pairs.
import { contrast, parseCssColor, resolveVar } from "./color"
import type { ExtraToken, ModeVars } from "./types"

export const MIN_TEXT_CONTRAST = 4.5
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
const LENGTH = /^(0|\d+(\.\d+)?(px|rem))$/

export const toPx = (value: string) => (value.endsWith("rem") ? parseFloat(value) * 16 : parseFloat(value))

/** Errors for one extra token; `taken` = names already used by the design system or other extras. */
export function validateExtra(token: ExtraToken, prefix: string, taken: Set<string>): string[] {
  const errors: string[] = []
  if (!KEBAB.test(prefix)) errors.push("Префикс проекта: только латиница в нижнем регистре, цифры и дефисы")
  if (!KEBAB.test(token.name)) errors.push("Имя: kebab-case (например mb-promo-surface)")
  else if (!token.name.startsWith(`${prefix}-`)) errors.push(`Имя должно начинаться с префикса «${prefix}-»`)
  if (taken.has(token.name)) errors.push(`Токен «${token.name}» уже есть`)
  for (const mode of ["light", "dark"] as const) {
    const value = token[mode].trim()
    if (!value) errors.push(`${mode}: нужно значение`)
    else if (token.kind === "color" && !parseCssColor(value) && !/^var\(--[\w-]+\)$/.test(value)) {
      errors.push(`${mode}: не цвет (hex, oklch(), rgb() или var(--токен))`)
    } else if (token.kind !== "color" && !LENGTH.test(value)) {
      errors.push(`${mode}: нужна длина в px или rem (например 12px)`)
    }
  }
  return errors
}

/** Which fill a foreground token is read on: explicit pairWith, else the name without "-foreground". */
export function pairOf(token: ExtraToken): string | null {
  if (token.kind !== "color") return null
  if (token.pairWith) return token.pairWith
  return token.name.endsWith("-foreground") ? token.name.slice(0, -"-foreground".length) : null
}

export type ContrastResult = {
  name: string
  pair: string
  mode: "light" | "dark"
  ratio: number | null
  ok: boolean
}

const colorOf = (value: string | undefined, vars: ModeVars) => {
  const resolved = value === undefined ? null : resolveVar(value, vars)
  return resolved ? parseCssColor(resolved) : null
}

/** AA check for every extra foreground in both modes. `light`/`dark` are the full var maps incl. extras. */
export function contrastChecks(extras: ExtraToken[], light: ModeVars, dark: ModeVars): ContrastResult[] {
  const out: ContrastResult[] = []
  const merged = { light, dark: { ...light, ...dark } }
  for (const token of extras) {
    const pair = pairOf(token)
    if (!pair) continue
    for (const mode of ["light", "dark"] as const) {
      const vars = merged[mode]
      const fg = colorOf(vars[token.name], vars)
      const bg = colorOf(vars[pair], vars)
      const ratio = fg && bg ? Math.round(contrast(fg, bg) * 100) / 100 : null
      out.push({ name: token.name, pair, mode, ratio, ok: ratio !== null && ratio >= MIN_TEXT_CONTRAST })
    }
  }
  return out
}
