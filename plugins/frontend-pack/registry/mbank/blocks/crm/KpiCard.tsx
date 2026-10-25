import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"
import { Card } from "@/shared/ui/card"
import { Skeleton } from "@/shared/ui/skeleton"

/* Delta colour is about meaning, not sign: "−18 мин" to decision time is good (positive). */
const deltaVariants = cva("text-sm font-medium", {
  variants: {
    tone: { positive: "text-success-text", negative: "text-destructive-text", neutral: "text-muted-foreground" },
  },
  defaultVariants: { tone: "neutral" },
})

type KpiCardProps = {
  label: string
  /** Already formatted: "86", "64%", "2 ч 14 мин". */
  value?: string
  /** Already formatted with sign: "+14%", "−18 мин". */
  delta?: string
  /** What the delta compares to: "к вчера". */
  deltaLabel?: string
  deltaTone?: "positive" | "negative" | "neutral"
  loading?: boolean
  className?: string
}

/** Figma `CRM / KPI card` (266x128): label 14 muted, value 24 bold, delta 14 + caption muted. */
export function KpiCard({
  label,
  value,
  delta,
  deltaLabel,
  deltaTone = "neutral",
  loading = false,
  className,
}: KpiCardProps) {
  return (
    <Card
      data-slot="kpi-card"
      aria-busy={loading || undefined}
      className={cn("min-h-32 gap-2 border-transparent p-4 sm:p-5", className)}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-5 w-32" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {delta && (
            <p className="flex flex-wrap items-baseline gap-x-1">
              <span className={deltaVariants({ tone: deltaTone })}>{delta}</span>
              {deltaLabel && <span className="text-caption text-muted-foreground">{deltaLabel}</span>}
            </p>
          )}
        </>
      )}
    </Card>
  )
}
