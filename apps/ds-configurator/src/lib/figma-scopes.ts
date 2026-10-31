// Figma variable scopes by role, COPIED from plugins/figma-pack/builder/core/tokens.js (scopesFor),
// so pickers only offer sensible colours. Copied, not imported: apps must not load plugin files.
export function scopesFor(token: string): string[] {
  const t = token.split("/").pop() ?? token
  if (/(^|-)foreground$/.test(t) || /(^|-)(txt|text)(-|$)/.test(t)) return ["TEXT_FILL", "SHAPE_FILL", "STROKE_COLOR"]
  if (/^(border|input|ring|ring-offset)$|-(border|ring)$|(^|-)border-/.test(t)) return ["STROKE_COLOR", "FRAME_FILL", "SHAPE_FILL"]
  if (/^chart-/.test(t)) return ["SHAPE_FILL", "FRAME_FILL", "STROKE_COLOR"]
  return ["FRAME_FILL", "SHAPE_FILL"]
}
