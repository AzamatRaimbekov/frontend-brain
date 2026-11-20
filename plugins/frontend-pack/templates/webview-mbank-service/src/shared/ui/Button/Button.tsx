import { cn } from '@shared/libs/cn'
import {
  Button as BaseButton,
  ButtonProps as BaseButtonProps,
} from '@shared/ui/base/button'

export type ButtonProps = BaseButtonProps & {
  block?: boolean
  fullWidth?: boolean
  loading?: boolean
}

export function Button({
  block,
  className,
  disabled,
  fullWidth,
  loading,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      aria-busy={loading || undefined}
      className={cn(block && 'block w-full', fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      type={type}
      {...props}
    />
  )
}
