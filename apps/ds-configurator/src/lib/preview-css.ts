// CSS text for the live preview: the design system's vars scoped to [data-preview] (light) and
// [data-preview].dark, like upstream design-system-provider buildThemeCssText does for :root/.dark.
import { getFontDefinition } from "@/upstream/config"

import { fontFamily } from "./tokens"
import type { DesignSystem, ModeVars } from "./types"

const rule = (selector: string, vars: ModeVars) =>
  `${selector} {\n${Object.entries(vars).filter(([, v]) => Boolean(v)).map(([k, v]) => `  --${k}: ${v};`).join("\n")}\n}\n`

export function buildPreviewCss(ds: DesignSystem) {
  return [
    rule("[data-preview]", { ...ds.theme, ...ds.light }),
    rule("[data-preview].dark", ds.dark),
    "[data-preview] { font-family: var(--font-sans); }",
    "[data-preview] h2, [data-preview] h3 { font-family: var(--font-heading); }",
  ].join("\n")
}

const GOOGLE = new Set(["Geist", "Geist Mono", "Inter"])

/** Google Fonts stylesheet for the preview: the /create fonts, or Geist/Inter named in a project stack. */
export function fontStylesheetUrl(ds: DesignSystem) {
  const titles = ds.googleFonts
    ? [ds.config.font, ds.config.fontHeading].filter((n) => n !== "inherit").map((n) => getFontDefinition(n)?.title)
    : [fontFamily(ds.values.font.sans), fontFamily(ds.values.font.heading)].filter((t) => GOOGLE.has(t))
  const families = [...new Set(titles.filter((t): t is string => Boolean(t)))]
  if (!families.length) return null
  return `https://fonts.googleapis.com/css2?${families.map((t) => `family=${t.replaceAll(" ", "+")}:wght@400;500;600;700`).join("&")}&display=swap`
}
