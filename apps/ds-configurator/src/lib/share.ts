// URL <-> state. Upstream options travel as the upstream preset code (?preset=b...); our additions as
// plain params. Extra tokens live in localStorage (per browser), they are too long for a URL.
import { getThemesForBaseColor } from "@/upstream/config"
import { decodePreset, encodePreset } from "@/upstream/preset"

import { MBANK_BRANDS } from "./mbank"
import { DEFAULT_STATE, type ConfiguratorState, type ExtraToken } from "./types"

const EXTRAS_KEY = "ds-configurator:extras"

/** Keeps the state consistent with the upstream picker rules. */
export function normalizeState(s: ConfiguratorState): ConfiguratorState {
  const next = { ...s }
  if (!getThemesForBaseColor(next.baseColor).some((t) => t.name === next.theme)) next.theme = next.baseColor
  if (next.style === "rhea" && next.radius === "large") next.radius = "medium" // upstream disables Large for Rhea
  if (!MBANK_BRANDS.includes(next.brand)) next.brand = MBANK_BRANDS[0]
  return next
}

export function stateToSearch(s: ConfiguratorState) {
  const params = new URLSearchParams({ preset: encodePreset(s), source: s.source, brand: s.brand, prefix: s.prefix })
  if (!s.chartColor) params.set("charts", "source")
  return `?${params.toString()}`
}

export function stateFromSearch(search: string, extras: ExtraToken[] = []): ConfiguratorState {
  const params = new URLSearchParams(search)
  const decoded = decodePreset(params.get("preset") ?? "")
  const source = params.get("source") === "shadcn" ? "shadcn" : "mbank"
  return normalizeState({
    ...DEFAULT_STATE,
    ...(decoded ?? {}),
    ...(params.get("charts") === "source" || !decoded ? { chartColor: undefined } : {}),
    source,
    brand: params.get("brand") ?? DEFAULT_STATE.brand,
    prefix: params.get("prefix") ?? DEFAULT_STATE.prefix,
    extras,
  })
}

export function loadExtras(): ExtraToken[] {
  try {
    const raw = localStorage.getItem(EXTRAS_KEY)
    const list = raw ? (JSON.parse(raw) as ExtraToken[]) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function saveExtras(extras: ExtraToken[]) {
  try {
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(extras))
  } catch {
    // private mode: extras stay in memory only
  }
}
