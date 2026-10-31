import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/* Fixture for contract-to-code.test.mjs: a cva block, a part block and a const map. */
// @contract chip start
const chipVariants = cva(
  "flex items-center gap-1 rounded-full font-medium whitespace-nowrap hover:bg-surface-3 [&>svg]:size-4",
  {
    variants: {
      tone: {
        neutral: "bg-surface-2 text-foreground",
        brand: "bg-brand text-brand-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
)
// @contract chip end

// @contract chip.size start
const chipSizes = { sm: "h-6 px-2 text-xs", md: "h-8 px-3 text-sm" } as const
// @contract chip.size end

type ChipProps = React.ComponentProps<"span"> &
  VariantProps<typeof chipVariants> & { size?: keyof typeof chipSizes }

function Chip({ className, tone, size = "md", children, ...props }: ChipProps) {
  return (
    <span data-slot="chip" className={cn(chipVariants({ tone }), chipSizes[size], className)} {...props}>
      <span
        className={cn(
          // @contract chip.label start
          "truncate text-sm",
          // @contract chip.label end
        )}
      >
        {children}
      </span>
    </span>
  )
}

export { Chip, chipVariants }
