import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"
import { SearchIcon } from "./icons"

/*
 * Search input (Figma `input/search`). Generated from the contract
 * registry/mbank/contracts/search-input.json by contract-to-code --new (template card-like).
 * Change the look in the contract and run contract-to-code --write; the block between the markers is generated.
 * Accessibility: see the component comment below.
 */
// @contract search-input start
const searchInputVariants = cva(
  "gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground hover:border-input-hover focus-within:border-ring has-disabled:border-input-disabled has-disabled:bg-muted has-disabled:text-disabled-foreground flex items-center focus-within:ring-[3px] focus-within:ring-ring/30 [&_svg]:size-5 [&_svg]:text-muted-foreground w-full transition-colors has-disabled:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-9 rounded-sm",
        md: "h-11",
        lg: "h-14 px-4 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
)
// @contract search-input end

type SearchInputProps = Omit<React.ComponentProps<"input">, "size" | "type"> & VariantProps<typeof searchInputVariants>

/** Search field: magnifier on the left, a native type="search" input; pass aria-label when there is no visible label. */
function SearchInput({ className, size, ...props }: SearchInputProps) {
  return (
    <div data-slot="search-input" className={cn(searchInputVariants({ size }), className)}>
      <SearchIcon aria-hidden="true" />
      <input
        type="search"
        data-slot="search-input-field"
        className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        {...props}
      />
    </div>
  )
}

export { SearchInput, searchInputVariants }
