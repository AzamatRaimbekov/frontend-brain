import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/*
 * Coloured status dot of the CRM drafts (stage stepper 12px, timeline 12px, scoring reasons 6px).
 * Colours as the designers bound them: border/accent/positive|warning|danger, neutral border/global/soft/default.
 * Decorative: the meaning must also be in the text next to it.
 */
const statusDotVariants = cva("inline-block shrink-0 rounded-full", {
  variants: {
    tone: {
      success: "bg-border-success",
      warning: "bg-border-warning",
      error: "bg-border-destructive",
      info: "bg-status-info",
      neutral: "bg-input",
      brand: "bg-brand",
    },
    size: { sm: "size-1.5", md: "size-3" },
  },
  defaultVariants: { tone: "neutral", size: "md" },
})

type StatusDotTone = NonNullable<VariantProps<typeof statusDotVariants>["tone"]>

function StatusDot({
  className,
  tone,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof statusDotVariants>) {
  return (
    <span
      data-slot="status-dot"
      data-tone={tone ?? "neutral"}
      aria-hidden="true"
      className={cn(statusDotVariants({ tone, size }), className)}
      {...props}
    />
  )
}

export { StatusDot, statusDotVariants, type StatusDotTone }
