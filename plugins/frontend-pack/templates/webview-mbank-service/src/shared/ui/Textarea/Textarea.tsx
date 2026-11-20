import { cn } from '@shared/libs/cn'
import { Textarea as TextareaBase } from '@shared/ui/base/textarea'

import { TextareaHTMLAttributes, forwardRef } from 'react'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean
  floatingLabel?: boolean
  status?: 'error'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error = false, floatingLabel, status, ...props }, ref) => {
    const isError = error || status === 'error'

    return (
      <TextareaBase
        aria-invalid={isError || undefined}
        className={cn(
          'data-[floating-label=true]:pt-8 data-[floating-label=true]:pb-3',
          className,
        )}
        data-floating-label={floatingLabel || undefined}
        ref={ref}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'
