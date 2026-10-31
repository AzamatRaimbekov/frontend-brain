import type * as React from "react"

import { cn } from "@/shared/lib/utils"

/** Loading placeholder (no Web components skeleton yet, G11/G12): surface-2 with pulse. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        // @contract skeleton start
        "animate-pulse rounded-md bg-surface-2 motion-reduce:animate-none",
        // @contract skeleton end
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
