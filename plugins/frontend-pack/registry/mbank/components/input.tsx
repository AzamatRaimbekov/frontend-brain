import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/*
 * Figma `input/default` (and password, phone, search ...). Size L 56 / M 44 / S 36.
 * States: hover -> border/global/soft/hover, focus -> brand ring, error -> aria-invalid,
 * disabled -> border/global/soft/disabled + text/disabled.
 */
// @contract input start
const inputVariants = cva(
  "flex w-full min-w-0 rounded-md border border-input bg-background px-3 text-foreground transition-colors outline-none placeholder:text-muted-foreground hover:border-input-hover focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:border-input-disabled disabled:bg-muted disabled:text-disabled-foreground aria-invalid:border-border-destructive aria-invalid:ring-border-destructive/20 file:border-0 file:bg-transparent file:text-sm file:font-medium",
  {
    variants: {
      size: {
        sm: "h-9 text-sm",
        md: "h-11 text-sm",
        lg: "h-14 px-4 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
)
// @contract input end

type InputProps = Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>

function Input({ className, type, size, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
