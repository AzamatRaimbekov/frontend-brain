import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { periodListClass } from "./PeriodSwitch"

export type PeriodOption<T extends string> = { value: T; label: string }

type PeriodSegmentProps<T extends string> = {
  /** Section title on the left, e.g. "Конвейер на 12 октября" (h2). */
  title: React.ReactNode
  value: T
  onValueChange: (value: T) => void
  options: PeriodOption<T>[]
  /** Content for the selected period (KPI, board): rendered as the active tab panel. */
  children: React.ReactNode
  label?: string
  className?: string
}

/**
 * Figma `Period` row: title + `segment` (48px, Сегодня / Неделя / Месяц / Квартал).
 * Built on kit Tabs, so the period switch and the content are a real tablist + tabpanel.
 */
export function PeriodSegment<T extends string>({
  title,
  value,
  onValueChange,
  options,
  children,
  label = "Период",
  className,
}: PeriodSegmentProps<T>) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      data-slot="period-segment"
      className={cn("gap-6", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <TabsList aria-label={label} className={periodListClass}>
          {options.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="h-10 flex-1 rounded-md px-2 text-sm font-normal text-soft-foreground sm:flex-none sm:px-4 sm:text-base group-data-[variant=segment]/tabs-list:rounded-md"
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <TabsContent value={value} className="flex flex-col gap-6">
        {children}
      </TabsContent>
    </Tabs>
  )
}
