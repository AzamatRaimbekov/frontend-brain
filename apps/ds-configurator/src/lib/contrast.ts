// WCAG AA of the shadcn text/fill pairs: X-foreground on X, foreground on background.
import { contrast } from "./color"
import { COLOR_NAMES, colorHex, type Mode, type TokenValues } from "./tokens"

export const MIN_TEXT_CONTRAST = 4.5

export type ContrastCheck = { fg: string; bg: string; mode: Mode; ratio: number | null; ok: boolean }

export const CONTRAST_PAIRS: [string, string][] = COLOR_NAMES.flatMap((fg): [string, string][] => {
  const bg = fg === "foreground" ? "background" : fg.endsWith("-foreground") ? fg.slice(0, -"-foreground".length) : null
  return bg && COLOR_NAMES.includes(bg) ? [[fg, bg]] : []
})

export function contrastChecks(values: TokenValues): ContrastCheck[] {
  const out: ContrastCheck[] = []
  for (const [fg, bg] of CONTRAST_PAIRS) {
    for (const mode of ["light", "dark"] as const) {
      const a = colorHex(values, fg, mode)
      const b = colorHex(values, bg, mode)
      const ratio = a && b ? Math.round(contrast(a, b) * 100) / 100 : null
      out.push({ fg, bg, mode, ratio, ok: ratio !== null && ratio >= MIN_TEXT_CONTRAST })
    }
  }
  return out
}
