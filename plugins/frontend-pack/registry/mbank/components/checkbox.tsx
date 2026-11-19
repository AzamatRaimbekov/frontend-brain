import type * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/shared/lib/utils"
import { CheckIcon, MinusIcon } from "./icons"

/*
 * Figma `Switchers - Check` Type=Checkbox on shadcn tokens: checked = primary, error = aria-invalid
 * (destructive), disabled = opacity-50. Indeterminate is supported in code.
 */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // @contract checkbox start
        "peer size-5 shrink-0 rounded-sm border border-input bg-background transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed aria-invalid:border-destructive data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground disabled:opacity-50",
        // @contract checkbox end
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group flex items-center justify-center text-current"
      >
        <CheckIcon className="size-3.5 group-data-[state=indeterminate]:hidden" strokeWidth={3} />
        <MinusIcon className="hidden size-3.5 group-data-[state=indeterminate]:block" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
