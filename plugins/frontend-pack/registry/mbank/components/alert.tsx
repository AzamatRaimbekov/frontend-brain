import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/*
 * Figma `alert-text` on shadcn tokens: tone clear (card) or error (destructive text), as upstream Alert.
 */
// @contract alert start
const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current border border-border",
  {
    variants: {
      tone: {
        clear: "bg-card text-card-foreground",
        error: "bg-card text-destructive",
      },
    },
    defaultVariants: { tone: "clear" },
  },
)
// @contract alert end

type AlertProps = React.ComponentProps<"div"> & VariantProps<typeof alertVariants>

function Alert({ className, tone, ...props }: AlertProps) {
  const urgent = tone === "error"
  return (
    <div
      data-slot="alert"
      role={urgent ? "alert" : "status"}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        // @contract alert.title start
        "col-start-2 font-bold",
        // @contract alert.title end
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("col-start-2 grid justify-items-start gap-1 [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
