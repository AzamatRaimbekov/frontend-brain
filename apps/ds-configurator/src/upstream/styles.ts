// Forked from shadcn-ui/ui apps/v4/registry/styles.tsx (MIT). Icons stripped: the
// configurator shows the title and description only.
export const STYLES = [
  { name: "vega", title: "Vega", description: "Clean, neutral, and familiar" },
  { name: "nova", title: "Nova", description: "Reduced padding and margins" },
  { name: "maia", title: "Maia", description: "Rounded, with generous spacing." },
  { name: "lyra", title: "Lyra", description: "Boxy and sharp. For mono fonts." },
  { name: "mira", title: "Mira", description: "Made for compact interfaces." },
  { name: "luma", title: "Luma", description: "Fluid, luminous, and soft." },
  { name: "sera", title: "Sera", description: "Editorial and typographic." },
  { name: "rhea", title: "Rhea", description: "Like Luma but compact." },
] as const

export type Style = (typeof STYLES)[number]
