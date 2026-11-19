import { describe, expect, it } from "vitest"

import { buildDesignSystem } from "@/lib/design-system"
import { buildFigmaPlan } from "@/lib/export/figma-plan"
import { buildFigmaScript, figmaPlanOf } from "@/lib/export/figma-script"
import { applyOverrides, COLOR_NAMES, SHADCN_TOKENS } from "@/lib/tokens"
import { DEFAULT_STATE } from "@/lib/types"

import { createFakeFigma, runUseFigma } from "./fake-figma"

const ds = () => buildDesignSystem(DEFAULT_STATE)
const hex = (c: { r: number; g: number; b: number }) =>
  `#${[c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("")}`

describe("figma plan", () => {
  it("collection shadcn, Light/Dark, shadcn names with raw values", () => {
    const plan = figmaPlanOf(ds())
    expect(plan).toMatchObject({ $schema: "ds-configurator/figma-plan@2", collection: "shadcn", modes: ["Light", "Dark"] })
    expect(plan.variables.map((v) => v.name)).toEqual([
      ...COLOR_NAMES, "radius", "radius-sm", "radius-md", "radius-lg", "radius-xl", "radius-2xl", "radius-3xl", "radius-4xl", "font-sans", "font-heading",
    ])
    const v = (n: string) => plan.variables.find((x) => x.name === n)!
    expect(v("primary")).toMatchObject({ type: "COLOR", editable: true, overridden: false, scopes: ["FRAME_FILL", "SHAPE_FILL"], codeSyntax: "var(--primary)" })
    expect(v("primary").values.light).toEqual({ value: "#171717", css: "oklch(0.205 0 0)" })
    expect(v("border").values.dark.value).toBe("#ffffff1a")
    expect(v("primary-foreground").scopes).toContain("TEXT_FILL")
    expect(v("radius")).toMatchObject({ type: "FLOAT", scopes: ["CORNER_RADIUS"], values: { light: { value: 10, css: "0.625rem" } } })
    expect(v("radius-xl")).toMatchObject({ editable: false, derived: true, values: { light: { value: 14 } } })
    expect(v("font-sans")).toMatchObject({ type: "STRING", scopes: ["FONT_FAMILY"], values: { light: { value: "Geist", css: "'Geist Variable', sans-serif" } } })
    expect(v("font-heading").values.light).toEqual({ value: "Geist", css: "var(--font-sans)", ref: "font-sans" })
    expect(JSON.stringify(plan)).not.toMatch(/alias/)
  })

  it("marks overrides and keeps the default in base", () => {
    const plan = buildFigmaPlan({ project: "p", name: "P", version: 2 }, applyOverrides(SHADCN_TOKENS, { ring: { dark: "var(--primary)" } }), SHADCN_TOKENS)
    const ring = plan.variables.find((x) => x.name === "ring")!
    expect(ring.overridden).toBe(true)
    expect(ring.values.dark).toEqual({ value: "#e5e5e5", css: "var(--primary)", ref: "primary" })
    expect(ring.base.dark.css).toBe("oklch(0.556 0 0)")
  })
})

describe("use_figma script", () => {
  it("creates collection shadcn with Light/Dark and writes raw values", async () => {
    const f = createFakeFigma()
    const report = await runUseFigma(buildFigmaScript(ds()), f.figma)
    const col = [...f.cols.values()].find((c) => c.name === "shadcn")!
    expect(col.modes.map((m) => m.name)).toEqual(["Light", "Dark"])
    const [light, dark] = col.modes.map((m) => m.modeId)
    const primary = f.find("shadcn", "primary")!
    expect(hex(primary.valuesByMode[light] as never)).toBe("#171717")
    expect(hex(primary.valuesByMode[dark] as never)).toBe("#e5e5e5")
    expect(primary.codeSyntax.WEB).toBe("var(--primary)")
    expect(f.find("shadcn", "radius-lg")!.valuesByMode[light]).toBe(10)
    expect(f.find("shadcn", "font-sans")!.valuesByMode[dark]).toBe("Geist")
    expect(report.created).toBe(report.written)
    expect(report.skipped).toEqual([])

    const again = await runUseFigma(buildFigmaScript(ds()), f.figma)
    expect(again.created).toBe(0)
    expect(col.modes).toHaveLength(2)
  })
})
