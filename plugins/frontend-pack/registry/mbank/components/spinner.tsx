import type * as React from "react"

import { cn } from "@/shared/lib/utils"

/** Figma `spinner` (Mode=Primary/onLight/onDark): colour comes from currentColor. */
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      data-slot="spinner"
      role="status"
      aria-label="Загрузка"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-4 animate-spin motion-reduce:animate-none", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export { Spinner }
