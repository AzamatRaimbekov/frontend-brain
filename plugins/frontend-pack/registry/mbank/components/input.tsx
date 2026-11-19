import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/*
 * Figma `input/default` (and password, phone, search ...). Size L 56 / M 44 / S 36.
 * shadcn tokens: border-input, focus ring, error = aria-invalid (destructive), disabled = opacity-50.
 */
// @contract input start
const inputVariants = cva(
  "flex w-full min-w-0 rounded-md border border-input bg-background px-3 text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-destructive/20 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:opacity-50 dark:aria-invalid:ring-destructive/40",
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
