import { Input as InputPrimitive } from '@base-ui/react/input'
import { cn } from '@shared/libs/cn'

import * as React from 'react'

// shadcn Input (Base UI) in the Mbank look: 58px / 48px, radius 20px, brand focus.
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  function Input({ className, type, ...props }, ref) {
    return (
      <InputPrimitive
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          'h-[58px] w-full min-w-0 rounded-[20px] border border-transparent bg-card px-4 text-base text-foreground transition-colors outline-none placeholder:text-input focus-visible:border-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive',
          className,
        )}
        {...props}
      />
    )
  },
)

export { Input }
