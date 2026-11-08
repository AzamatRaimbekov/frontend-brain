import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/*
 * Figma `spinner` (Size 16 S / 20 M / 24 X -> sm / md / lg, Mode=Primary/onLight/onDark): colour comes from
 * currentColor. The size block is generated from the contract registry/mbank/contracts/spinner.json
 * (contract-to-code --write); bigger sizes via className (size-10 … size-20).
 */
// @contract spinner start
const spinnerVariants = cva(
  "shrink-0 animate-spin motion-reduce:animate-none",
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
      },
    },
    defaultVariants: { size: "sm" },
  },
)
// @contract spinner end

type SpinnerProps = Omit<React.ComponentProps<"svg">, "size"> & VariantProps<typeof spinnerVariants>

function Spinner({ className, size, ...props }: SpinnerProps) {
  return (
    <svg
      data-slot="spinner"
      role="status"
      aria-label="Загрузка"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export { Spinner, spinnerVariants }
