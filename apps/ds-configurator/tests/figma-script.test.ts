import { describe, expect, it } from "vitest"

import { buildDesignSystem } from "@/lib/design-system"
import { buildFigmaPayload, buildFigmaScript } from "@/lib/export/figma-script"
import { DEFAULT_STATE, type ConfiguratorState } from "@/lib/types"

import { createFakeFigma, runUseFigma } from "./fake-figma"

const extras: ConfiguratorState["extras"] = [
  { name: "mb-promo", kind: "color", light: "#16a34a", dark: "#189547" },
  { name: "mb-promo-foreground", kind: "color", light: "#ffffff", dark: "#ffffff" },
  { name: "mb-card", kind: "radius", light: "20px", dark: "20px" },
]
const ds = (over: Partial<ConfiguratorState> = {}) => buildDesignSystem({ ...DEFAULT_STATE, extras, ...over })
const hex = (c: { r: number; g: number; b: number }) =>
  `#${[c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("")}`

describe("figma script generation", () => {
  it("payload carries resolved values, scopes and Figma names", () => {
    const p = buildFigmaPayload(ds())
    const primary = p.colors.find((c) => c.name === "primary")!
    expect(hex(primary.light)).toBe("#fddb2b")
    expect(hex(primary.dark)).toBe("#f7c21c")
    const ring = p.colors.find((c) => c.name === "ring")!
    expect(hex(ring.light)).toBe("#16a34a") // var(--brand) resolved
    expect(p.colors.find((c) => c.name === "foreground")!.figma).toBe("text/default")
    expect(p.colors.find((c) => c.name === "mb-promo-foreground")!.scopes).toContain("TEXT_FILL")
    expect(p.floats).toContainEqual({ figma: "radius/default", css: "radius", value: 12, scopes: ["CORNER_RADIUS"] })
    expect(p.floats).toContainEqual({ figma: "radius/mb-card", css: "mb-card", value: 20, scopes: ["CORNER_RADIUS"] })
  })

  it("script contains the expected variable writes", () => {
    const code = buildFigmaScript(ds())
    expect(code).toContain("const LINK_THEME = false;")
    expect(code).toContain('"brand":"bank"')
    expect(code).toContain("createVariableCollection(DS.collection)")
    expect(code).toContain("'color/light/' + c.name")
    expect(code).toContain("setVariableCodeSyntax('WEB'")
  })

  it("creates Brand with a mode per brand on an empty file", async () => {
    const f = createFakeFigma()
    const report = await runUseFigma(buildFigmaScript(ds()), f.figma)
    const brand = [...f.cols.values()].find((c) => c.name === "Brand")!
    expect(brand.modes.map((m) => m.name)).toEqual(["bank"])
    const v = f.find("Brand", "color/light/primary")!
    expect(hex(v.valuesByMode[brand.modes[0].modeId] as never)).toBe("#fddb2b")
    expect(v.scopes).toEqual(["FRAME_FILL", "SHAPE_FILL"])
    expect(v.codeSyntax.WEB).toBe("var(--primary)")
    expect(f.find("Brand", "radius/mb-card")!.valuesByMode[brand.modes[0].modeId]).toBe(20)
    expect(report.linked).toBe(0)
    expect(report.created).toBe(report.written)

    // Second brand: new mode, values written only there, nothing created twice.
    const again = await runUseFigma(buildFigmaScript(ds({ brand: "kassa" })), f.figma)
    expect(brand.modes.map((m) => m.name)).toEqual(["bank", "kassa"])
    expect(again.created).toBe(0)
    const b = f.find("Brand", "color/light/brand")!
    expect(hex(b.valuesByMode[brand.modes[0].modeId] as never)).toBe("#16a34a")
    expect(hex(b.valuesByMode[brand.modes[1].modeId] as never)).toBe("#2563eb")
  })

  it("LINK_THEME aliases the existing 2.theme light/dark modes to Brand", async () => {
    const f = createFakeFigma()
    const theme = f.collection("2.theme", ["light", "dark"])
    const td = f.variable("text/default", theme, "COLOR")
    const report = await runUseFigma(buildFigmaScript(ds(), true), f.figma)
    expect(report.themeCollection).toBe("2.theme")
    const light = f.find("Brand", "color/light/foreground")!
    const dark = f.find("Brand", "color/dark/foreground")!
    expect(td.valuesByMode[theme.modes[0].modeId]).toEqual({ type: "VARIABLE_ALIAS", id: light.id })
    expect(td.valuesByMode[theme.modes[1].modeId]).toEqual({ type: "VARIABLE_ALIAS", id: dark.id })
    expect(td.scopes).toEqual(["TEXT_FILL", "SHAPE_FILL", "STROKE_COLOR"])
    expect(light.scopes).toEqual([]) // linked Brand vars stay out of pickers
    expect(f.find("2.theme", "mb-promo")).toBeDefined() // extras are created in the theme collection
    expect(report.missingInTheme).toContain("background/surface/light") // not in this small file
  })
})
