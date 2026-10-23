import type * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/shared/lib/utils"
import { CheckIcon, MinusIcon } from "./icons"

/*
 * Figma `Switchers - Check` Type=Checkbox. Selected uses the product brand (1.brand) so it follows
 * data-brand. TODO: confirm the selected fill against the Switchers frame (colour not in tokens.md).
 * Figma has no error/indeterminate states (G10); aria-invalid and indeterminate are added for code.
 */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-5 shrink-0 rounded-xs border border-input bg-background transition-colors outline-none hover:border-input-hover focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:border-input-disabled disabled:bg-muted aria-invalid:border-border-destructive data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-brand-foreground data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand data-[state=indeterminate]:text-brand-foreground disabled:data-[state=checked]:opacity-50",
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
