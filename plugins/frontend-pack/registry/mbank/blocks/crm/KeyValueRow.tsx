import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const valueVariants = cva("min-w-0 break-words text-sm", {
  variants: {
    tone: {
      default: "text-foreground",
      error: "text-destructive-text",
      warning: "text-warning-text",
      success: "text-success-text",
      muted: "text-muted-foreground",
    },
  },
  defaultVariants: { tone: "default" },
})

type KeyValueRowProps = VariantProps<typeof valueVariants> & {
  label: string
  children: React.ReactNode
  className?: string
}

/**
 * Figma `CRM / Key-value row` (36px): label 14 muted in a 196px column, value 14.
 * tone="error" for a problem value ("Не загружена — нужна за 6 мес"). Stacks on phones.
 */
export function KeyValueRow({ label, tone, children, className }: KeyValueRowProps) {
  return (
    <div
      data-slot="key-value-row"
      className={cn("grid gap-0.5 py-2 sm:min-h-9 sm:grid-cols-[196px_minmax(0,1fr)] sm:items-center sm:gap-x-0", className)}
    >
      <dt className="text-sm text-muted-foreground sm:pr-4">{label}</dt>
      <dd className={valueVariants({ tone })}>{children}</dd>
    </div>
  )
}
