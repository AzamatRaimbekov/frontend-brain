import type * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/shared/lib/utils"

/** Visible field label (Figma `Label Outside=on`). Pair with htmlFor. */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm font-medium text-soft-foreground select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-disabled-foreground peer-disabled:cursor-not-allowed peer-disabled:text-disabled-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { Label }
