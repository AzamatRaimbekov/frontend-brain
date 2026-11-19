import type * as React from "react"

import { cn } from "@/shared/lib/utils"

/** Loading placeholder as upstream shadcn: bg-accent with pulse. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        // @contract skeleton start
        "animate-pulse rounded-md bg-accent motion-reduce:animate-none",
        // @contract skeleton end
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
