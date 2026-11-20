import { cn } from '@shared/libs/cn'
import { Input } from '@shared/ui/base/input'

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react'

export type TextFiledSize = 'default' | 'compact' | 'large'

export type TextFiledProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> & {
  error?: boolean
  floatingLabel?: boolean
  size?: TextFiledSize
  status?: 'error'
  suffix?: ReactNode
  withPlaceholder?: boolean
}

export const TextFiled = forwardRef<HTMLInputElement, TextFiledProps>(
  (
    {
      className,
      error = false,
      floatingLabel,
      placeholder,
      size = 'default',
      status,
      suffix,
      withPlaceholder = true,
      ...props
    },
    ref,
  ) => {
    const isError = error || status === 'error'
    const input = (
      <Input
        aria-invalid={isError || undefined}
        className={cn(
          'data-[floating-label=true]:pt-5 data-[floating-label=true]:pb-1 data-[size=compact]:h-12',
          suffix && 'pr-12',
          className,
        )}
        data-size={size}
        data-floating-label={floatingLabel || undefined}
        placeholder={withPlaceholder ? placeholder : ''}
        ref={ref}
        {...props}
      />
    )

    if (!suffix) return input

    return (
      <div className="relative">
        {input}
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground">
          {suffix}
        </span>
      </div>
    )
  },
)

TextFiled.displayName = 'TextFiled'

export const TextField = TextFiled
