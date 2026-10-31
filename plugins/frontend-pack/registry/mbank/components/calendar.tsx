import { useEffect, useRef } from "react"
import type * as React from "react"
import { DayPicker, type DayButton, type ChevronProps } from "react-day-picker"
import { ru } from "react-day-picker/locale"

import { cn } from "@/shared/lib/utils"
import { buttonVariants } from "./button"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "./icons"

/*
 * Figma `molecules / Calendar-items`, `atoms / day-items` (active single day / start / mid / end,
 * today, disabled), `atoms / dayName-items`, `atoms / month+year`. shadcn calendar on
 * react-day-picker v9; Russian locale (Monday first) by default, pass locale to change it.
 * mode="single" | "range" | "multiple" come from DayPicker; captionLayout="dropdown" = month+year.
 */
function CalendarChevron({ orientation, className }: ChevronProps) {
  const Icon = orientation === "left" ? ChevronLeftIcon : orientation === "right" ? ChevronRightIcon : ChevronDownIcon
  return <Icon className={cn("size-5", orientation === "up" && "rotate-180", className)} />
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const single = modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
  return (
    <button
      ref={ref}
      data-day={day.isoDate}
      data-selected-single={single || undefined}
      data-range-start={modifiers.range_start || undefined}
      data-range-middle={modifiers.range_middle || undefined}
      data-range-end={modifiers.range_end || undefined}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-sm text-sm tabular-nums text-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:text-disabled-foreground",
        "data-[range-middle]:rounded-none data-[range-middle]:bg-transparent data-[range-middle]:hover:bg-brand-ghost-hover",
        "data-[selected-single]:bg-brand data-[selected-single]:text-brand-foreground data-[range-start]:bg-brand data-[range-start]:text-brand-foreground data-[range-end]:bg-brand data-[range-end]:text-brand-foreground",
        className,
      )}
      {...props}
    />
  )
}

type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, locale = ru, components, ...props }: CalendarProps) {
  const nav = buttonVariants({ variant: "ghost", size: "icon-sm" })
  return (
    <DayPicker
      data-slot="calendar"
      locale={locale}
      showOutsideDays={showOutsideDays}
      className={cn("w-fit bg-popover p-3 text-popover-foreground", className)}
      classNames={{
        root: "w-fit",
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-2",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(nav, "z-1 aria-disabled:opacity-50"),
        button_next: cn(nav, "z-1 aria-disabled:opacity-50"),
        month_caption: "flex h-9 items-center justify-center px-10",
        caption_label: "inline-flex items-center gap-1 text-sm font-medium first-letter:uppercase [&>svg]:size-4",
        dropdowns: "flex items-center gap-1 text-sm font-medium",
        dropdown_root: "relative rounded-sm px-2 py-1 hover:bg-accent has-focus-visible:ring-[3px] has-focus-visible:ring-ring/30",
        dropdown: "absolute inset-0 cursor-pointer opacity-0",
        month_grid: "border-collapse",
        weekdays: "flex",
        weekday: "w-10 text-xs font-normal text-muted-foreground capitalize",
        week: "mt-1 flex",
        day: "relative p-0 text-center",
        range_start: "rounded-l-sm bg-brand-muted",
        range_middle: "bg-brand-muted",
        range_end: "rounded-r-sm bg-brand-muted",
        today: "[&>button]:font-bold [&>button]:text-brand-text",
        outside: "[&>button]:text-muted-foreground",
        disabled: "[&>button]:text-disabled-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{ Chevron: CalendarChevron, DayButton: CalendarDayButton, ...components }}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
export type { CalendarProps }
