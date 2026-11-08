import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/*
 * Separator (Figma `Separator`). Generated from the contract
 * registry/mbank/contracts/separator.json by contract-to-code --new (template card-like).
 * Change the look in the contract and run contract-to-code --write; the block between the markers is generated.
 * Accessibility: see the component comment below.
 */
// @contract separator start
const separatorVariants = cva(
  "bg-border shrink-0",
  {
    variants: {
      orientation: {
        horizontal: "h-px w-full",
        vertical: "h-full w-px",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
)
// @contract separator end

type SeparatorProps = Omit<React.ComponentProps<"div">, "orientation"> &
  VariantProps<typeof separatorVariants> & {
    /** Decorative (default): hidden from screen readers; false -> role="separator". */
    decorative?: boolean
  }

function Separator({ className, orientation = "horizontal", decorative = true, ...props }: SeparatorProps) {
  return (
    <div
      data-slot="separator"
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : (orientation ?? undefined)}
      className={cn(separatorVariants({ orientation }), className)}
      {...props}
    />
  )
}

export { Separator, separatorVariants }
