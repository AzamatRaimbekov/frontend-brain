import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/shared/lib/utils"

/*
 * Figma `Progress bar / Determinate` (size s/m/l, square / rounded), `Progress-Line`
 * (state default / Success / Exeption -> tone, percent -> showValue) and `Progress circle`
 * (size s/m/l/xl, bottom text -> children). value is 0-100; null = indeterminate.
 * TODO: confirm bar heights and circle diameters against the Progress Bar & Uploading frame.
 */
const progressVariants = cva("relative w-full overflow-hidden bg-surface-2", {
  variants: {
    size: { sm: "h-1", md: "h-2", lg: "h-3" },
    shape: { rounded: "rounded-full", square: "rounded-none" },
  },
  defaultVariants: { size: "md", shape: "rounded" },
})

const indicatorTones = {
  brand: "bg-brand",
  success: "bg-status-success",
  error: "bg-status-error",
  warning: "bg-status-warning",
} as const

type ProgressProps = Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "value"> &
  VariantProps<typeof progressVariants> & {
    value?: number | null
    tone?: keyof typeof indicatorTones
    /** Percent text to the right of the bar (Figma `percent`). */
    showValue?: boolean
  }

const clamp = (value: number) => Math.min(Math.max(value, 0), 100)

function Progress({ className, value = null, size, shape, tone = "brand", showValue = false, ...props }: ProgressProps) {
  const bar = (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn(progressVariants({ size, shape }), !showValue && className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-transform duration-300 motion-reduce:transition-none",
          indicatorTones[tone],
          value === null && "w-1/3 animate-pulse",
        )}
        style={value === null ? undefined : { transform: `translateX(-${100 - clamp(value)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
  if (!showValue) return bar
  return (
    <div data-slot="progress-with-value" className={cn("flex items-center gap-3", className)}>
      {bar}
      <span className="w-10 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
        {value === null ? "" : `${Math.round(clamp(value))}%`}
      </span>
    </div>
  )
}

const circleSizes = { sm: 32, md: 48, lg: 64, xl: 96 } as const

type ProgressCircleProps = Omit<React.ComponentProps<"div">, "children"> & {
  value: number
  size?: keyof typeof circleSizes
  tone?: keyof typeof indicatorTones
  /** Text under the circle (Figma `bottom text`). The percent is always inside. */
  children?: React.ReactNode
}

const strokeTones = {
  brand: "stroke-brand",
  success: "stroke-status-success",
  error: "stroke-status-error",
  warning: "stroke-status-warning",
} as const

function ProgressCircle({ value, size = "md", tone = "brand", children, className, ...props }: ProgressCircleProps) {
  const px = circleSizes[size]
  const stroke = size === "sm" ? 3 : 4
  const radius = (px - stroke) / 2
  const length = 2 * Math.PI * radius
  const percent = clamp(value)
  return (
    <div
      data-slot="progress-circle"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      className={cn("inline-flex flex-col items-center gap-2", className)}
      {...props}
    >
      <span className="relative inline-flex items-center justify-center">
        <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} className="-rotate-90" aria-hidden="true">
          <circle cx={px / 2} cy={px / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-surface-2" />
          <circle
            cx={px / 2}
            cy={px / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={length}
            strokeDashoffset={length * (1 - percent / 100)}
            className={cn("transition-all duration-300 motion-reduce:transition-none", strokeTones[tone])}
          />
        </svg>
        {size !== "sm" && (
          <span className="absolute text-xs font-medium tabular-nums">{Math.round(percent)}%</span>
        )}
      </span>
      {children && <span className="text-sm text-muted-foreground">{children}</span>}
    </div>
  )
}

export { Progress, ProgressCircle, progressVariants }
export type { ProgressProps, ProgressCircleProps }
