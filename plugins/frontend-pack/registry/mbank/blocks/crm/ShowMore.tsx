import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"

type ShowMoreProps = Omit<React.ComponentProps<typeof Button>, "children" | "variant"> & {
  /** How many are hidden: renders "Показать ещё {count}". */
  count: number
  label?: (count: number) => string
}

/** Figma `Show more` under a board column: link-style 28px button. */
export function ShowMore({ count, label = (n) => `Показать ещё ${n}`, className, ...props }: ShowMoreProps) {
  if (count <= 0) return null
  return (
    <Button
      variant="link"
      size="xs"
      data-slot="show-more"
      className={cn("h-7 w-fit px-2 text-sm font-normal", className)}
      {...props}
    >
      {label(count)}
    </Button>
  )
}
