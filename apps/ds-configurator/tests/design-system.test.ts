import { describe, expect, it } from "vitest"

import { buildDesignSystem } from "@/lib/design-system"
import { MBANK } from "@/lib/mbank"
import { DEFAULT_STATE, type ConfiguratorState } from "@/lib/types"
import { decodePreset, encodePreset } from "@/upstream/preset"
import { THEMES } from "@/upstream/themes"

const state = (over: Partial<ConfiguratorState> = {}): ConfiguratorState => ({ ...DEFAULT_STATE, ...over })

describe("preset -> cssVars", () => {
  it("Mbank bank: Figma values from frontend-pack tokens.css", () => {
    const ds = buildDesignSystem(state())
    expect(ds.name).toBe("mbank-bank")
    expect(ds.light.primary).toBe("#fddb2b")
    expect(ds.dark.primary).toBe("#f7c21c")
    expect(ds.light.brand).toBe("#16a34a")
    expect(ds.dark.brand).toBe("#189547")
    expect(ds.light.radius).toBe("12px")
    expect(ds.theme["font-sans"]).toContain("Inter Mbank")
    expect(ds.figma.foreground).toBe("text/default")
  })

  it("Mbank brand modes change only the brand vars", () => {
    const bank = buildDesignSystem(state())
    const kassa = buildDesignSystem(state({ brand: "kassa" }))
    expect(kassa.light.brand).toBe("#2563eb")
    expect(kassa.dark.brand).toBe("#3b82f6")
    const changed = Object.keys(bank.light).filter((k) => bank.light[k] !== kassa.light[k])
    expect(changed.every((k) => k.startsWith("brand"))).toBe(true)
    expect(MBANK.brands).toEqual(["bank", "kassa", "travel", "artwin", "koko"])
  })

  it("Mbank exposes the shadcn slots as real vars (ring, popover, charts)", () => {
    const ds = buildDesignSystem(state())
    expect(ds.light.ring).toBe("var(--brand)")
    expect(ds.light.popover).toBe("var(--card)")
    expect(ds.light["chart-1"]).toBe("var(--supportive-1)")
    expect(ds.theme["color-ring"]).toBeUndefined()
    expect(ds.theme["radius-md"]).toBe("12px")
  })

  it("upstream transforms apply to Mbank: radius, bold menu accent, chart colour", () => {
    const ds = buildDesignSystem(state({ radius: "large", menuAccent: "bold", chartColor: "blue" }))
    expect(ds.light.radius).toBe("0.875rem")
    expect(ds.light.accent).toBe(ds.light.primary)
    const blue = THEMES.find((t) => t.name === "blue")!
    expect(ds.light["chart-1"]).toBe(blue.cssVars!.light!["chart-1"])
    expect(buildDesignSystem(state({ style: "lyra", radius: "large" })).light.radius).toBe("0")
  })

  it("shadcn source matches upstream base colour + theme", () => {
    const ds = buildDesignSystem(state({ source: "shadcn", baseColor: "zinc", theme: "blue" }))
    const blue = THEMES.find((t) => t.name === "blue")!
    const zinc = THEMES.find((t) => t.name === "zinc")!
    expect(ds.name).toBe("zinc-blue")
    expect(ds.light.primary).toBe(blue.cssVars!.light!.primary)
    expect(ds.light.background).toBe(zinc.cssVars!.light!.background)
    expect(ds.theme["font-sans"]).toBe("'Inter Variable', sans-serif")
  })

  it("preset code round-trips through the upstream encoder", () => {
    const s = state({ style: "maia", theme: "violet", font: "geist", radius: "small" })
    const decoded = decodePreset(encodePreset(s))!
    expect(decoded).toMatchObject({ style: "maia", theme: "violet", font: "geist", radius: "small" })
  })
})
