import { cn } from '@shared/libs/cn'
import { OTPInput, OTPInputContext } from 'input-otp'

import * as React from 'react'

// shadcn InputOTP in the Mbank look: 55x58 slots, radius 8px, 28px bold digits.
function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        'flex w-max items-center has-disabled:opacity-55',
        containerClassName,
      )}
      spellCheck={false}
      className={cn(
        'text-[28px] font-bold disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  placeholder = '-',
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number
  placeholder?: string
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      aria-hidden="true"
      className={cn(
        'relative flex h-[58px] w-[55px] items-center justify-center rounded-[8px] bg-card text-[28px] leading-none font-bold text-foreground transition-all outline-none data-[active=true]:outline-2 data-[active=true]:outline-offset-2 data-[active=true]:outline-primary/45',
        className,
      )}
      {...props}
    >
      {char ?? <span className="text-2xl">{placeholder}</span>}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-7 w-0.5 animate-caret-blink rounded-xs bg-primary" />
        </div>
      )}
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot }
