import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/shared/lib/utils"

/*
 * Figma `Badge-status` ghost tones: neutral (accent), accent (primary), success / warning / info / error
 * (status token at 10% + its colour as text), clear (outline).
 */
// @contract badge start
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap font-medium [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "bg-accent text-accent-foreground",
        accent: "bg-primary text-primary-foreground",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        info: "bg-info/10 text-info",
        error: "bg-destructive/10 text-destructive",
        clear: "text-foreground border border-border",
      },
      shape: {
        rounded: "rounded-full",
        square: "rounded-sm",
      },
      size: {
        sm: "h-5 px-1.5 text-xs",
        md: "h-6 px-2 text-xs",
        lg: "h-7 px-2.5 text-sm",
      },
    },
    defaultVariants: { tone: "neutral", shape: "rounded", size: "md" },
  },
)
// @contract badge end

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }

function Badge({ className, tone, shape, size, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"
  return (
    <Comp
      data-slot="badge"
      data-tone={tone ?? "neutral"}
      className={cn(badgeVariants({ tone, shape, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
