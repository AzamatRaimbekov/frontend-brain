// Configurator state / project values -> resolved design system. Every exporter and the live preview
// read this, so code, tokens.css and Figma get the same values. Only the standard shadcn names exist.
import { buildRegistryTheme, getFontDefinition } from "@/upstream/config"
import { DEFAULT_PRESET_CONFIG, type PresetConfig } from "@/upstream/preset"

import { COLOR_NAMES, SHADCN_TOKENS, toVars, type TokenValues } from "./tokens"
import { CANONICAL, DEFAULT_STATE, type ConfiguratorState, type DesignSystem } from "./types"

export function fromValues(name: string, values: TokenValues, config: PresetConfig = DEFAULT_STATE, googleFonts = false): DesignSystem {
  return { name, values, ...toVars(values), config, googleFonts }
}

/** CSS stack of a /create font name; "canonical" is the canonical sans stack (not a Google font). */
const fontStack = (name: string) => (name === CANONICAL ? SHADCN_TOKENS.font.sans : getFontDefinition(name)?.family)

/** Token values of a /create configuration: upstream theme maps, kept to the canonical names. */
export function stateValues(state: ConfiguratorState): TokenValues {
  const { light, dark } = buildRegistryTheme(state)
  const colors: TokenValues["colors"] = {}
  for (const name of COLOR_NAMES) {
    const base = SHADCN_TOKENS.colors[name]
    colors[name] = { light: light[name] ?? base.light, dark: dark[name] ?? light[name] ?? base.dark }
  }
  const sans = fontStack(state.font) ?? SHADCN_TOKENS.font.sans
  const heading =
    state.fontHeading === "inherit" || state.fontHeading === state.font
      ? "var(--font-sans)"
      : (fontStack(state.fontHeading) ?? "var(--font-sans)")
  return { radius: light.radius ?? SHADCN_TOKENS.radius, font: { sans, heading }, colors }
}

export const designSystemName = (state: ConfiguratorState) => `${state.baseColor}-${state.theme}`

export function buildDesignSystem(state: ConfiguratorState): DesignSystem {
  return fromValues(designSystemName(state), stateValues(state), state, true)
}

/** A project's design system: canonical defaults + overrides, plain /create config, free font stacks. */
export const projectDesignSystem = (id: string, values: TokenValues) =>
  fromValues(id, values, { ...DEFAULT_PRESET_CONFIG, ...DEFAULT_STATE }, false)
