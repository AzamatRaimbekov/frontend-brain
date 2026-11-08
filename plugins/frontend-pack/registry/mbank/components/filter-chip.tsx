import type * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"
import { ChevronDownIcon } from "./icons"

/*
 * Filter chip (Figma `Item / chipsButton`). Generated from the contract
 * registry/mbank/contracts/filter-chip.json by contract-to-code --new (template button-like).
 * Change the look in the contract and run contract-to-code --write; the block between the markers is generated.
 * Accessibility: see the component comment below.
 */
// @contract filter-chip start
const filterChipVariants = cva(
  "items-center gap-1 px-3 h-9 rounded-sm border border-outline bg-background text-sm font-medium text-foreground hover:border-border-secondary aria-pressed:bg-secondary aria-pressed:border-secondary aria-pressed:text-inverse-foreground [&_svg]:size-5 inline-flex shrink-0 whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 [&_svg]:shrink-0",
)
// @contract filter-chip end

type FilterChipProps = React.ComponentProps<"button"> & {
  /** A filter value is chosen: aria-pressed (dark look). */
  selected?: boolean
  /** Chevron for a chip that opens a list of values (default true). */
  chevron?: boolean
}

/** Toolbar filter chip: label + chevron; opens a Popover/DropdownMenu with the values. */
function FilterChip({ className, selected = false, chevron = true, children, ...props }: FilterChipProps) {
  return (
    <button
      type="button"
      data-slot="filter-chip"
      aria-pressed={selected}
      className={cn(filterChipVariants(), className)}
      {...props}
    >
      {children}
      {chevron && <ChevronDownIcon aria-hidden="true" />}
    </button>
  )
}

export { FilterChip, filterChipVariants }
