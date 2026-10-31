import type * as React from "react"

import { cn } from "@/shared/lib/utils"

/** Figma `TextArea` (Size L/M/S): same states and tokens as Input. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // @contract textarea start
        "flex field-sizing-content min-h-24 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground hover:border-input-hover focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:border-input-disabled disabled:bg-muted disabled:text-disabled-foreground aria-invalid:border-border-destructive aria-invalid:ring-border-destructive/20",
        // @contract textarea end
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
