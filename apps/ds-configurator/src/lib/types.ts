import { DEFAULT_PRESET_CONFIG, type PresetConfig } from "@/upstream/preset"

import type { TokenValues } from "./tokens"

/** The /create options: base colour, theme, fonts, radius... all within the standard shadcn token set. */
export type ConfiguratorState = PresetConfig

export type ModeVars = Record<string, string>

/** Resolved design system: what every exporter reads. Var keys have no leading "--". */
export type DesignSystem = {
  name: string
  /** The shadcn token values (37 colours, radius, fonts). */
  values: TokenValues
  light: ModeVars
  dark: ModeVars
  theme: ModeVars
  /** /create options the registry item config is written from. */
  config: PresetConfig
  /** Fonts are upstream Google fonts (registry font items) rather than a free CSS stack. */
  googleFonts: boolean
}

/** Option value (base colour, theme, chart colour, font) meaning the canonical token values. */
export const CANONICAL = "canonical"

// Defaults = the canonical tokens (src/data/shadcn-tokens.json): the "canonical" base colour, theme,
// charts and font, radius default (= canonical radius). Other /create options are alternatives.
export const DEFAULT_STATE: ConfiguratorState = {
  ...DEFAULT_PRESET_CONFIG,
  style: "nova",
  baseColor: "canonical",
  theme: "canonical",
  chartColor: "canonical",
  font: "canonical",
  fontHeading: "inherit",
}
