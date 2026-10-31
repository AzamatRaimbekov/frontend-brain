// CSS text for the live preview: the design system's vars scoped to [data-preview] (light) and
// [data-preview].dark, like upstream design-system-provider buildThemeCssText does for :root/.dark.
import { getFontDefinition } from "@/upstream/config"

import type { DesignSystem, ModeVars } from "./types"

// The kit reads Mbank-only vars (brand, *-hover, soft...). For a shadcn source they follow the
// shadcn slots so the preview stays coherent; exports do not include these.
const SHADCN_COMPAT: ModeVars = {
  brand: "var(--primary)",
  "brand-hover": "var(--primary)",
  "brand-active": "var(--primary)",
  "brand-foreground": "var(--primary-foreground)",
  "primary-hover": "var(--primary)",
  "primary-active": "var(--primary)",
  "secondary-hover": "var(--secondary)",
  "secondary-active": "var(--secondary)",
  soft: "var(--secondary)",
  "soft-hover": "var(--accent)",
  "soft-foreground-strong": "var(--secondary-foreground)",
  "ghost-hover": "var(--accent)",
  outline: "var(--border)",
  "outline-foreground": "var(--foreground)",
  "destructive-foreground": "var(--primary-foreground)",
}

function buildCssRule(selector: string, vars: ModeVars) {
  const body = Object.entries(vars)
    .filter(([, v]) => Boolean(v))
    .map(([k, v]) => `  --${k}: ${v};`)
    .join("\n")
  return `${selector} {\n${body}\n}\n`
}

// shadcn/tailwind.css derives the radius scale from --radius.
const SHADCN_RADIUS: ModeVars = {
  "radius-sm": "calc(var(--radius) - 4px)",
  "radius-md": "calc(var(--radius) - 2px)",
  "radius-lg": "var(--radius)",
  "radius-xl": "calc(var(--radius) + 4px)",
}

export function buildPreviewCss(ds: DesignSystem) {
  const radii = Object.fromEntries(Object.entries(ds.theme).filter(([k]) => k.startsWith("radius-")))
  const compat = ds.state.source === "shadcn" ? { ...SHADCN_COMPAT, ...SHADCN_RADIUS } : radii
  const font = ds.theme["font-sans"]
  const heading = ds.theme["font-heading"]
  return [
    buildCssRule("[data-preview]", { ...compat, ...ds.light }),
    buildCssRule("[data-preview].dark", ds.dark),
    `[data-preview] { font-family: ${font ?? "inherit"}; }`,
    heading ? `[data-preview] h2, [data-preview] h3 { font-family: ${heading}; }` : "",
  ].join("\n")
}

/** Google Fonts stylesheet for the selected upstream fonts (none for the Mbank stack). */
export function fontStylesheetUrl(ds: DesignSystem) {
  const names = [ds.state.font, ds.state.fontHeading].filter((n) => n !== "inherit")
  const fonts = names
    .filter((n) => !(ds.state.source === "mbank" && n === "inter" && ds.state.font === n))
    .map((n) => getFontDefinition(n))
    .filter((f) => f !== undefined)
  if (!fonts.length) return null
  const families = [...new Set(fonts.map((f) => f.title))].map((t) => `family=${t.replaceAll(" ", "+")}:wght@400;500;600;700`)
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`
}
