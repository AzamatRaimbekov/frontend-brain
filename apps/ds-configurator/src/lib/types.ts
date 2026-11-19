import { DEFAULT_PRESET_CONFIG, type PresetConfig } from "@/upstream/preset"

import type { TokenValues } from "./tokens"

/** The /create options: base colour, theme, fonts, radius... all within the standard shadcn token set. */
export type ConfiguratorState = PresetConfig

export type ModeVars = Record<string, string>

/** Resolved design system: what every exporter reads. Var keys have no leading "--". */
export type DesignSystem = {
  name: string
  /** The shadcn token values (31 colours, radius, fonts). */
  values: TokenValues
  light: ModeVars
  dark: ModeVars
  theme: ModeVars
  /** /create options the registry item config is written from. */
  config: PresetConfig
  /** Fonts are upstream Google fonts (registry font items) rather than a free CSS stack. */
  googleFonts: boolean
}

// Defaults = the canonical shadcn tokens: neutral base colour and theme, Geist, radius default.
export const DEFAULT_STATE: ConfiguratorState = {
  ...DEFAULT_PRESET_CONFIG,
  style: "nova",
  baseColor: "neutral",
  theme: "neutral",
  chartColor: "neutral",
  font: "geist",
  fontHeading: "inherit",
}
