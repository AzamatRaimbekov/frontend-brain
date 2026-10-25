import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"

type HeaderIconButtonProps = React.ComponentProps<typeof Button> & {
  /** Accessible name, e.g. "Уведомления". */
  label: string
  /** Red dot in the corner (Figma `Bell` + `indicator` 8px). */
  indicator?: boolean
}

/** Figma `iconCont` 36x36 on background/surface/soft with a 20px icon. */
export function HeaderIconButton({ label, indicator = false, className, children, ...props }: HeaderIconButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={indicator ? `${label}, есть новые` : label}
      className={cn("relative bg-muted text-foreground hover:bg-accent", className)}
      {...props}
    >
      {children}
      {indicator && (
        <span aria-hidden="true" className="absolute top-2 right-2 size-2 rounded-full bg-status-error ring-2 ring-muted" />
      )}
    </Button>
  )
}
