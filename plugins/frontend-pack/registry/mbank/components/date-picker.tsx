import { useState } from "react"
import type * as React from "react"
import type { DateRange, Matcher } from "react-day-picker"

import { cn } from "@/shared/lib/utils"
import { Calendar, type CalendarProps } from "./calendar"
import { CalendarIcon } from "./icons"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

/*
 * Figma `input/calendar-single` / `input/calendar-multi`: trigger from contract date-picker-trigger (L 56 / M 44 / S 36,
 * error -> aria-invalid) with the calendar icon; opens Calendar in a Popover. value + onValueChange; Label Outside -> Label.
 */
// @contract date-picker-trigger.size start
const pickerSizes = { sm: "h-9", md: "h-11", lg: "h-14 px-4 text-base" } as const
// @contract date-picker-trigger.size end

const defaultFormat = (date: Date) => new Intl.DateTimeFormat("ru-RU").format(date)

type PickerBaseProps = Omit<React.ComponentProps<"button">, "value" | "defaultValue" | "onChange"> & {
  size?: "sm" | "md" | "lg"
  placeholder?: string
  /** Display format of a date in the trigger; default 31.10.2026. */
  formatDate?: (date: Date) => string
  /** Days that cannot be picked, e.g. { after: new Date() }. */
  disabledDays?: Matcher | Matcher[]
  /** Extra Calendar props: month+year dropdowns, allowed months, another locale. */
  calendarProps?: Pick<CalendarProps, "captionLayout" | "startMonth" | "endMonth" | "locale" | "showOutsideDays" | "className">
}

type PickerShellProps = PickerBaseProps & {
  text?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  calendar: React.ReactNode
}

function PickerShell({ size = "md", placeholder, text, open, onOpenChange, calendar, className, ...props }: PickerShellProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="date-picker"
          data-placeholder={text ? undefined : ""}
          className={cn(
            // @contract date-picker-trigger start
            "gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground hover:border-input-hover focus-visible:border-ring disabled:border-input-disabled disabled:bg-muted disabled:text-disabled-foreground flex items-center justify-between focus-visible:ring-[3px] focus-visible:ring-ring/30 aria-invalid:border-border-destructive data-[placeholder]:text-muted-foreground w-full text-left whitespace-nowrap transition-colors outline-none disabled:pointer-events-none",
            // @contract date-picker-trigger end
            pickerSizes[size], className,
          )}
          {...props}
        >
          <span className="truncate">{text ?? placeholder}</span>
          <CalendarIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        {calendar}
      </PopoverContent>
    </Popover>
  )
}

type DatePickerProps = PickerBaseProps & {
  value?: Date
  onValueChange: (date: Date | undefined) => void
}

function DatePicker({
  value,
  onValueChange,
  placeholder = "Выберите дату",
  formatDate = defaultFormat,
  disabledDays,
  calendarProps,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  return (
    <PickerShell
      {...props}
      placeholder={placeholder}
      text={value ? formatDate(value) : undefined}
      open={open}
      onOpenChange={setOpen}
      calendar={
        <Calendar
          {...calendarProps}
          mode="single"
          selected={value}
          defaultMonth={value}
          disabled={disabledDays}
          onSelect={(date) => {
            onValueChange(date)
            setOpen(false)
          }}
          autoFocus
        />
      }
    />
  )
}

type DateRangePickerProps = PickerBaseProps & {
  value?: DateRange
  onValueChange: (range: DateRange | undefined) => void
  /** Months shown side by side; default 2. */
  numberOfMonths?: number
}

function DateRangePicker({
  value,
  onValueChange,
  placeholder = "Выберите период",
  formatDate = defaultFormat,
  disabledDays,
  calendarProps,
  numberOfMonths = 2,
  ...props
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const from = value?.from ? formatDate(value.from) : undefined
  const text = from && (value?.to ? `${from} – ${formatDate(value.to)}` : `${from} – …`)
  return (
    <PickerShell
      {...props}
      placeholder={placeholder}
      text={text}
      open={open}
      onOpenChange={setOpen}
      calendar={
        <Calendar
          {...calendarProps}
          mode="range"
          selected={value}
          defaultMonth={value?.from}
          numberOfMonths={numberOfMonths}
          disabled={disabledDays}
          onSelect={onValueChange}
          autoFocus
        />
      }
    />
  )
}

export { DatePicker, DateRangePicker }
export type { DatePickerProps, DateRangePickerProps, DateRange }
