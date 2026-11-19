import Ajv from "ajv"
import { describe, expect, it } from "vitest"

import { buildDesignSystem, projectDesignSystem } from "@/lib/design-system"
import { buildRegistryItem } from "@/lib/export/registry-item"
import { buildTokensCss } from "@/lib/export/tokens-css"
import { applyOverrides, COLOR_NAMES, SHADCN_TOKENS } from "@/lib/tokens"
import { DEFAULT_STATE } from "@/lib/types"
import schema from "@/upstream/registry-item.schema.json"

// Vendored copy of https://ui.shadcn.com/schema/registry-item.json (upstream apps/v4/public/schema).
const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false }) // its $schema is the https draft-07 URL
const validate = ajv.compile(schema)

describe("registry:base export", () => {
  it("the vendored schema validator rejects invalid items", () => {
    expect(validate({ name: "x" })).toBe(false)
    expect(validate({ name: "x", type: "registry:ui", style: "nova" })).toBe(false)
  })

  const systems = [
    buildDesignSystem(DEFAULT_STATE),
    buildDesignSystem({ ...DEFAULT_STATE, baseColor: "stone", theme: "rose", font: "inter", fontHeading: "lora" }),
    projectDesignSystem("credit", applyOverrides(SHADCN_TOKENS, { primary: { light: "#7c3aed" }, "font-sans": { light: "'Inter', sans-serif" } })),
  ]
  for (const ds of systems) {
    it(`is valid against the shadcn registry-item schema (${ds.name})`, () => {
      const ok = validate(JSON.parse(JSON.stringify(buildRegistryItem(ds))))
      expect(validate.errors ?? []).toEqual([])
      expect(ok).toBe(true)
    })
  }

  it("has the registry:base shape the shadcn CLI reads, only shadcn names", () => {
    const item = buildRegistryItem(buildDesignSystem(DEFAULT_STATE))
    expect(item).toMatchObject({
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: "neutral-neutral",
      type: "registry:base",
      extends: "none",
      config: { style: "radix-nova", iconLibrary: "lucide", menuAccent: "subtle", menuColor: "default", tailwind: { baseColor: "neutral" } },
      registryDependencies: ["utils", "font-geist"],
      meta: { figma: { collection: "shadcn", modes: ["Light", "Dark"] } },
    })
    expect(item.cssVars.light.primary).toBe("oklch(0.205 0 0)")
    expect(item.cssVars.dark.border).toBe("oklch(1 0 0 / 10%)")
    expect(Object.keys(item.cssVars.dark)).toEqual(COLOR_NAMES)
    expect(item.cssVars.theme["radius-xl"]).toBe("calc(var(--radius) * 1.4)")
  })

  it("a project's free font stack goes to cssVars.theme, no font registry item", () => {
    const item = buildRegistryItem(systems[2])
    expect(item.registryDependencies).toEqual(["utils"])
    expect(item.cssVars.theme["font-sans"]).toBe("'Inter', sans-serif")
    expect(item.cssVars.light.primary).toBe("#7c3aed")
  })
})

describe("tokens.css export", () => {
  it("has :root, .dark, @theme inline mappings for the shadcn names only", () => {
    const css = buildTokensCss(buildDesignSystem(DEFAULT_STATE))
    expect(css).toMatch(/:root \{\n {2}--radius: 0.625rem;\n {2}--background: oklch\(1 0 0\);/)
    expect(css).toMatch(/\.dark \{[^}]*--primary: oklch\(0.922 0 0\);/)
    expect(css).toContain("--color-sidebar-ring: var(--sidebar-ring);")
    expect(css).toContain("--radius-sm: calc(var(--radius) * 0.6);")
    expect(css).toContain("--font-heading: var(--font-sans);")
    expect(css).not.toContain("--color-radius:")
    expect(css.match(/--color-[\w-]+:/g)).toHaveLength(31)
  })
})
