import { cn } from '@shared/libs/cn'

import * as React from 'react'

// shadcn Textarea in the Mbank look: radius 20px, min 120px, brand focus.
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        'min-h-[120px] w-full resize-y rounded-[20px] border border-transparent bg-card p-4 text-base text-foreground transition-colors outline-none placeholder:text-input focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive',
        className,
      )}
      {...props}
    />
  )
})

export { Textarea }
