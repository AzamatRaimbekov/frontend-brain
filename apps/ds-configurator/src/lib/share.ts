// URL <-> state. The /create options travel as the upstream preset code (?preset=b...).
import { getThemesForBaseColor } from "@/upstream/config"
import { decodePreset, encodePreset } from "@/upstream/preset"

import { DEFAULT_STATE, type ConfiguratorState } from "./types"

/** Keeps the state consistent with the upstream picker rules. */
export function normalizeState(s: ConfiguratorState): ConfiguratorState {
  const next = { ...s }
  if (!getThemesForBaseColor(next.baseColor).some((t) => t.name === next.theme)) next.theme = next.baseColor
  if (next.style === "rhea" && next.radius === "large") next.radius = "medium" // upstream disables Large for Rhea
  return next
}

export const stateToSearch = (s: ConfiguratorState) => `?${new URLSearchParams({ preset: encodePreset(s) }).toString()}`

export function stateFromSearch(search: string): ConfiguratorState {
  const decoded = decodePreset(new URLSearchParams(search).get("preset") ?? "")
  return normalizeState({ ...DEFAULT_STATE, ...(decoded ?? {}) })
}
