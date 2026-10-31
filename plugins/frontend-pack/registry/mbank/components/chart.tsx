import { createContext, use, useId } from "react"
import type * as React from "react"
import { ResponsiveContainer } from "recharts"

import { cn } from "@/shared/lib/utils"

/*
 * Figma `Chart` (Type Lines / Coulm / Coulm group, Stacked, Hover) and `Chart-tooltip`, CRM
 * `Widget-Chart`. shadcn chart pattern on recharts: ChartContainer sets --color-<key> for every
 * series in ChartConfig, series use fill / stroke = "var(--color-<key>)". Without a colour a series
 * takes the Mbank supportive palette in order (supportive-1..10), so light / dark follow the tokens.
 */
type ChartConfig = Record<string, { label?: React.ReactNode; color?: string; icon?: React.ComponentType }>

const ChartContext = createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = use(ChartContext)
  if (!context) throw new Error("useChart must be used inside <ChartContainer />")
  return context
}

/** CSS variables --color-<key> for each series; unset colours walk the supportive palette. */
function chartColorVars(config: ChartConfig) {
  const vars: Record<string, string> = {}
  Object.entries(config).forEach(([key, item], index) => {
    vars[`--color-${key}`] = item.color ?? `var(--supportive-${(index % 10) + 1})`
  })
  return vars as React.CSSProperties
}

type ChartContainerProps = Omit<React.ComponentProps<"div">, "children"> & {
  config: ChartConfig
  /** One recharts chart (LineChart, BarChart, AreaChart ...). */
  children: React.ComponentProps<typeof ResponsiveContainer>["children"]
}

function ChartContainer({ id, className, config, style, children, ...props }: ChartContainerProps) {
  const uid = useId()
  return (
    <ChartContext value={{ config }}>
      <div
        data-slot="chart"
        data-chart={id ?? uid}
        style={{ ...chartColorVars(config), ...style }}
        className={cn(
          "flex aspect-video justify-center text-xs text-muted-foreground",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-surface-1 [&_.recharts-reference-line_line]:stroke-border",
          "[&_.recharts-layer]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        {/* initialDimension: first paint before measuring (SSR, tests) instead of a 0x0 chart. */}
        <ResponsiveContainer initialDimension={{ width: 320, height: 200 }}>{children}</ResponsiveContainer>
      </div>
    </ChartContext>
  )
}

/** Config entry for a tooltip / legend item: by nameKey in the payload, else by dataKey / name. */
function getPayloadConfig(config: ChartConfig, item: { dataKey?: unknown; name?: unknown; payload?: unknown }, key?: string) {
  const payload = (item.payload ?? {}) as Record<string, unknown>
  const fromPayload = key ? payload[key] : undefined
  const name = typeof fromPayload === "string" ? fromPayload : String(key ?? item.dataKey ?? item.name ?? "value")
  return config[name] ?? config[String(item.dataKey ?? item.name)]
}

export { ChartContainer, useChart, getPayloadConfig, chartColorVars }
export type { ChartConfig, ChartContainerProps }
