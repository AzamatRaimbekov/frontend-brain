// The Mbank preset: tokens from Figma (frontend-pack registry/mbank, copied at prebuild).
import preset from "@/generated/mbank-preset.json"

import type { ModeVars } from "./types"

type MbankPreset = {
  brands: string[]
  light: ModeVars
  dark: ModeVars
  brandLight: Record<string, ModeVars>
  brandDark: Record<string, ModeVars>
  theme: ModeVars
  figma: Record<string, string>
}

export const MBANK = preset as unknown as MbankPreset
export const MBANK_BRANDS = MBANK.brands
export const MBANK_FONT_STACK = MBANK.theme["font-sans"]

// shadcn slots Mbank keeps as @theme aliases (color-ring: var(--brand) ...) become real vars, so
// shadcn components and Figma see them. Charts follow the supportive palette.
function shadcnSlots(light: ModeVars, theme: ModeVars) {
  const slots: ModeVars = {}
  for (const [key, value] of Object.entries(theme)) {
    const name = key.startsWith("color-") ? key.slice(6) : null
    if (name && !(name in light) && /^var\(--[\w-]+\)$/.test(value)) slots[name] = value
  }
  for (let i = 1; i <= 5; i++) if (!(`chart-${i}` in light)) slots[`chart-${i}`] = `var(--supportive-${i})`
  return slots
}

/** Light, dark and theme vars of one Mbank brand. */
export function mbankVars(brand: string) {
  if (!MBANK.brandLight[brand]) throw new Error(`Unknown Mbank brand "${brand}"`)
  const slots = shadcnSlots(MBANK.light, MBANK.theme)
  const theme = Object.fromEntries(
    Object.entries(MBANK.theme).filter(([k]) => !(k.startsWith("color-") && k.slice(6) in slots))
  )
  return {
    light: { ...MBANK.light, ...slots, ...MBANK.brandLight[brand] },
    dark: { ...MBANK.dark, ...MBANK.brandDark[brand] },
    theme,
  }
}
