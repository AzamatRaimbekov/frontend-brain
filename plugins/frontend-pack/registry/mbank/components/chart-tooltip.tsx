import type * as React from "react"
import { Legend, Tooltip } from "recharts"

import { cn } from "@/shared/lib/utils"
import { getPayloadConfig, useChart } from "./chart"

/*
 * Figma `Chart-tooltip`: card surface, shadow/dropdown, a colour mark per series.
 * <ChartTooltip content={<ChartTooltipContent />} />, <ChartLegend content={<ChartLegendContent />} />.
 * recharts injects active / payload / label into the content element.
 */
const ChartTooltip = Tooltip
const ChartLegend = Legend

type ChartPayloadItem = {
  name?: string | number
  dataKey?: string | number | ((obj: never) => unknown)
  value?: unknown
  color?: string
  payload?: unknown
}

type ChartTooltipContentProps = {
  active?: boolean
  payload?: ReadonlyArray<ChartPayloadItem>
  label?: React.ReactNode
  hideLabel?: boolean
  indicator?: "dot" | "line"
  /** Key in the data row that names the series (pie charts). */
  nameKey?: string
  labelFormatter?: (label: React.ReactNode) => React.ReactNode
  valueFormatter?: (value: unknown) => React.ReactNode
  className?: string
}

const dataKeyOf = (item: ChartPayloadItem) => (typeof item.dataKey === "function" ? undefined : item.dataKey)

function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  indicator = "dot",
  nameKey,
  labelFormatter,
  valueFormatter = (value) => (typeof value === "number" ? value.toLocaleString("ru-RU") : String(value ?? "")),
  className,
}: ChartTooltipContentProps) {
  const { config } = useChart()
  if (!active || !payload?.length) return null

  return (
    <div
      data-slot="chart-tooltip"
      className={cn("grid min-w-32 gap-1.5 rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-dropdown", className)}
    >
      {!hideLabel && label != null && <div className="font-medium">{labelFormatter ? labelFormatter(label) : label}</div>}
      {payload.map((item, index) => {
        const entry = getPayloadConfig(config, { ...item, dataKey: dataKeyOf(item) }, nameKey)
        const key = String(dataKeyOf(item) ?? item.name ?? index)
        return (
          <div key={key} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn("shrink-0 rounded-xs", indicator === "dot" ? "size-2.5" : "h-2.5 w-1")}
              style={{ backgroundColor: item.color ?? `var(--color-${key})` }}
            />
            <span className="flex-1 text-muted-foreground">{entry?.label ?? item.name}</span>
            <span className="font-medium tabular-nums text-foreground">{valueFormatter(item.value)}</span>
          </div>
        )
      })}
    </div>
  )
}

type ChartLegendContentProps = {
  payload?: ReadonlyArray<{ value?: unknown; dataKey?: unknown; color?: string }>
  verticalAlign?: "top" | "middle" | "bottom"
  hideIcon?: boolean
  nameKey?: string
  className?: string
}

function ChartLegendContent({ payload, verticalAlign = "bottom", hideIcon = false, nameKey, className }: ChartLegendContentProps) {
  const { config } = useChart()
  if (!payload?.length) return null

  return (
    <ul
      data-slot="chart-legend"
      className={cn("flex flex-wrap items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
    >
      {payload.map((item) => {
        const key = String(nameKey ?? item.dataKey ?? item.value ?? "value")
        const entry = getPayloadConfig(config, { dataKey: key, name: item.value })
        const Icon = entry?.icon
        return (
          <li key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {Icon && !hideIcon ? (
              <Icon />
            ) : (
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-xs" style={{ backgroundColor: item.color }} />
            )}
            {entry?.label ?? String(item.value ?? key)}
          </li>
        )
      })}
    </ul>
  )
}

export { ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent }
export type { ChartTooltipContentProps, ChartLegendContentProps }
