import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/shared/lib/utils"

/*
 * Figma `Badge-status`: Appearance (status roles) -> tone, Solid on/off -> fill solid/ghost, Form rounded/squared, Size.
 * Ghost (Solid=off) uses status/ghost/*, solid uses status/filled/*.
 */
// @contract badge start
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap font-medium [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "bg-status-neutral-muted text-status-neutral-foreground",
        accent: "bg-status-accent-muted text-status-accent-foreground",
        success: "bg-status-success-muted text-status-success-foreground",
        warning: "bg-status-warning-muted text-status-warning-foreground",
        error: "bg-status-error-muted text-status-error-foreground",
        info: "bg-status-info-muted text-status-info-foreground",
        clear: "bg-status-clear-muted text-status-clear-foreground",
      },
      fill: { ghost: "", solid: "text-status-filled-foreground" },
      shape: { rounded: "rounded-full", square: "rounded-xs" },
      size: {
        sm: "h-5 px-1.5 text-xs",
        md: "h-6 px-2 text-xs",
        lg: "h-7 px-2.5 text-sm",
      },
    },
    compoundVariants: [
      { fill: "solid", tone: "neutral", className: "bg-status-neutral" },
      { fill: "solid", tone: "accent", className: "bg-status-accent" },
      { fill: "solid", tone: "success", className: "bg-status-success" },
      { fill: "solid", tone: "warning", className: "bg-status-warning" },
      { fill: "solid", tone: "error", className: "bg-status-error" },
      { fill: "solid", tone: "info", className: "bg-status-info" },
      { fill: "solid", tone: "clear", className: "bg-status-clear" },
    ],
    defaultVariants: { tone: "neutral", fill: "ghost", shape: "rounded", size: "md" },
  },
)
// @contract badge end

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }

function Badge({ className, tone, fill, shape, size, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"
  return (
    <Comp
      data-slot="badge"
      data-tone={tone ?? "neutral"}
      className={cn(badgeVariants({ tone, fill, shape, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
