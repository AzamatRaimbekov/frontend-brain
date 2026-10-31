import { DEFAULT_PRESET_CONFIG, type PresetConfig } from "@/upstream/preset"

/** Where the base tokens come from: the Mbank Figma tokens or an upstream shadcn base colour + theme. */
export type Source = "mbank" | "shadcn"

export type ExtraTokenKind = "color" | "radius" | "size"

/** A project token on top of the design system. `name` is kebab-case with the project prefix. */
export type ExtraToken = {
  name: string
  kind: ExtraTokenKind
  light: string
  dark: string
  /** Fill this foreground is read on (contrast check). Default: the name without "-foreground". */
  pairWith?: string
}

export type ConfiguratorState = PresetConfig & {
  source: Source
  brand: string
  prefix: string
  extras: ExtraToken[]
}

export type ModeVars = Record<string, string>

/** Resolved design system: what every exporter reads. Keys have no leading "--". */
export type DesignSystem = {
  name: string
  light: ModeVars
  dark: ModeVars
  theme: ModeVars
  /** CSS var -> Figma variable name in the theme collection (Mbank only). */
  figma: Record<string, string>
  state: ConfiguratorState
}

export const DEFAULT_STATE: ConfiguratorState = {
  ...DEFAULT_PRESET_CONFIG,
  style: "nova",
  font: "inter",
  // undefined = the source's own chart colours (Mbank supportive-1..5; shadcn: the theme's).
  chartColor: undefined,
  source: "mbank",
  brand: "bank",
  prefix: "mb",
  extras: [],
}
