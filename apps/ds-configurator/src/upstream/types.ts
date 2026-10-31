// Minimal local stand-in for `RegistryItem` from "shadcn/schema" (upstream imports the
// zod-inferred type; the configurator only needs the fields the forked data uses).
export type CssVars = {
  theme?: Record<string, string>
  light?: Record<string, string>
  dark?: Record<string, string>
}

export type RegistryItem = {
  name: string
  title?: string
  type: string
  description?: string
  dependencies?: string[]
  cssVars?: CssVars
  meta?: Record<string, unknown>
}
