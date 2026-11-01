import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const valueVariants = cva("min-w-0 break-words text-sm font-medium", {
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
 * Figma `CRM / Key-value row` (contract crm-key-value-row): row gap 16, py 8, label 180px body/s muted,
 * value body/s medium, top-aligned. tone="error" for a problem value ("Не загружена — нужна за 6 мес").
 * Stacks on phones.
 */
export function KeyValueRow({ label, tone, children, className }: KeyValueRowProps) {
  return (
    <div
      data-slot="key-value-row"
      className={cn("grid gap-0.5 py-2 sm:min-h-9 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start sm:gap-x-4", className)}
    >
      <dt data-slot="key-value-row-label" className="text-sm text-muted-foreground">
        {label}
      </dt>
      <dd data-slot="key-value-row-value" className={valueVariants({ tone })}>
        {children}
      </dd>
    </div>
  )
}
