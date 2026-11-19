// shadcn registry item of type registry:base (the whole design system), valid against
// https://ui.shadcn.com/schema/registry-item.json. Built by the forked upstream buildRegistryBase.
import { buildRegistryBase } from "@/upstream/config"
import { encodePreset } from "@/upstream/preset"

import type { DesignSystem } from "../types"

export const REGISTRY_ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json"

export function buildRegistryItem(ds: DesignSystem) {
  const s = ds.config
  const base = buildRegistryBase({
    name: ds.name,
    config: s,
    cssVars: { theme: ds.theme, light: ds.light, dark: ds.dark },
    // A project's font is a free CSS stack in cssVars.theme; /create fonts come as registry font items.
    fontRegistryDependency: ds.googleFonts,
  })
  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    ...base,
    title: ds.googleFonts ? `${s.baseColor} / ${s.theme}` : ds.name,
    description: ds.googleFonts
      ? `shadcn/ui design system: base colour ${s.baseColor}, theme ${s.theme}`
      : `${ds.name}: shadcn/ui design system (standard shadcn tokens)`,
    meta: {
      generator: "apps/ds-configurator",
      tokens: "shadcn/tokens@1",
      preset: encodePreset(s),
      figma: { collection: "shadcn", modes: ["Light", "Dark"] },
    },
  }
}

export const registryItemJson = (ds: DesignSystem) => `${JSON.stringify(buildRegistryItem(ds), null, 2)}\n`
