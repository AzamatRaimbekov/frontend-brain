import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/*
 * Status dot of the CRM drafts (stage stepper 12px, timeline 12px, scoring reasons 6px).
 * Same tone names as the kit Badge, shadcn tokens only: accent = primary (done, positive), error = destructive,
 * neutral = muted-foreground (in progress, attention), clear = input (upcoming, inactive).
 * Decorative: the meaning must also be in the text next to it.
 */
const statusDotVariants = cva("inline-block shrink-0 rounded-full", {
  variants: {
    tone: {
      neutral: "bg-muted-foreground",
      accent: "bg-primary",
      error: "bg-destructive",
      clear: "bg-input",
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
