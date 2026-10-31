import { describe, expect, it } from "vitest"

import { contrast, parseCssColor } from "@/lib/color"
import { baseTokenNames, buildDesignSystem } from "@/lib/design-system"
import { contrastChecks, pairOf, validateExtra } from "@/lib/extra-tokens"
import { DEFAULT_STATE, type ExtraToken } from "@/lib/types"

const tok = (over: Partial<ExtraToken>): ExtraToken => ({ name: "mb-promo", kind: "color", light: "#ffffff", dark: "#000000", ...over })

describe("extra token validation", () => {
  const taken = baseTokenNames(DEFAULT_STATE)

  it("accepts a prefixed kebab-case colour", () => {
    expect(validateExtra(tok({}), "mb", taken)).toEqual([])
    expect(validateExtra(tok({ light: "oklch(0.7 0.1 250)", dark: "var(--brand)" }), "mb", taken)).toEqual([])
  })

  it("rejects bad names, a missing prefix and taken names", () => {
    expect(validateExtra(tok({ name: "mbPromo" }), "mb", taken).join()).toMatch(/kebab-case/)
    expect(validateExtra(tok({ name: "promo-surface" }), "mb", taken).join()).toMatch(/префикс/)
    expect(validateExtra(tok({ name: "brand" }), "brand", new Set(["brand"])).join()).toMatch(/уже есть/)
    expect(validateExtra(tok({}), "MB", taken).join()).toMatch(/Префикс/)
  })

  it("checks values by kind", () => {
    expect(validateExtra(tok({ light: "red-ish" }), "mb", taken).join()).toMatch(/не цвет/)
    expect(validateExtra(tok({ kind: "radius", light: "12px", dark: "0.75rem" }), "mb", taken)).toEqual([])
    expect(validateExtra(tok({ kind: "size", light: "12", dark: "12px" }), "mb", taken).join()).toMatch(/px или rem/)
  })
})

describe("contrast (WCAG AA 4.5)", () => {
  it("colour math matches the figma-pack copy", () => {
    expect(Math.round(contrast("#000000", "#ffffff"))).toBe(21)
    expect(parseCssColor("oklch(1 0 0)")).toBe("#ffffff")
    expect(parseCssColor("oklch(1 0 0 / 10%)")).toBe("#ffffff1a")
    expect(parseCssColor("rgb(14 15 17 / 0.08)")).toBe("#0e0f1114")
    expect(parseCssColor("12px")).toBeNull()
  })

  it("pairs a -foreground with its fill, resolving var() and dark fallback", () => {
    const extras = [
      tok({ name: "mb-promo", light: "#16a34a", dark: "#0e0f11" }),
      tok({ name: "mb-promo-foreground", light: "#ffffff", dark: "var(--foreground)" }),
    ]
    expect(pairOf(extras[1])).toBe("mb-promo")
    const ds = buildDesignSystem({ ...DEFAULT_STATE, extras })
    const res = contrastChecks(extras, ds.light, ds.dark)
    expect(res).toHaveLength(2)
    const light = res.find((r) => r.mode === "light")!
    expect(light.ratio).toBeLessThan(4.5) // white on Mbank green #16a34a = 3.3
    expect(light.ok).toBe(false)
    expect(res.find((r) => r.mode === "dark")!.ok).toBe(true) // #f0f3f4 on #0e0f11
  })

  it("explicit pairWith checks against a design-system fill", () => {
    const extras = [tok({ name: "mb-on-primary", light: "#0e0f11", dark: "#0e0f11", pairWith: "primary" })]
    const ds = buildDesignSystem({ ...DEFAULT_STATE, extras })
    expect(contrastChecks(extras, ds.light, ds.dark).every((r) => r.ok)).toBe(true)
  })
})
