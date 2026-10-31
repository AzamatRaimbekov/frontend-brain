import { cn } from "@/shared/lib/utils"

/** Figma `segment` of the `Period` row (48px): list and item looks, shared with PeriodSegment. */
export const periodListClass = "flex w-full items-center gap-1 rounded-lg bg-surface-2 p-1 sm:w-fit"
export const periodItemClass =
  "inline-flex h-10 flex-1 items-center justify-center rounded-md px-2 text-sm whitespace-nowrap text-soft-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30 sm:flex-none sm:px-4 sm:text-base"
const activeClass = "bg-background text-foreground shadow-xs"

type PeriodSwitchProps<T extends string> = {
  value: T
  onValueChange: (value: T) => void
  options: { value: T; label: string }[]
  label?: string
  className?: string
}

/**
 * Figma `segment` (Сегодня / Неделя / Месяц / Квартал) on its own, e.g. in the page title row
 * next to a heading. Toggle buttons (aria-pressed): use PeriodSegment when it switches a panel.
 */
export function PeriodSwitch<T extends string>({ value, onValueChange, options, label = "Период", className }: PeriodSwitchProps<T>) {
  return (
    <div role="group" aria-label={label} data-slot="period-switch" className={cn(periodListClass, className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onValueChange(option.value)}
          className={cn(periodItemClass, option.value === value && activeClass)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
