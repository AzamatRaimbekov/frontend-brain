import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@shared/ui/base/input-otp'
import { type OTPInputProps, REGEXP_ONLY_DIGITS } from 'input-otp'

export type OTPProps = Omit<
  OTPInputProps,
  | 'children'
  | 'containerClassName'
  | 'maxLength'
  | 'noScriptCSSFallback'
  | 'pattern'
  | 'render'
> & {
  containerClassName?: string
  length?: number
  type?: string
}

const defaultOtpLength = 6

const sanitizeOtpValue = (value: string) => value.replace(/\D/g, '')

export function OtpInput({
  className,
  containerClassName,
  disabled,
  inputMode = 'tel',
  length = defaultOtpLength,
  pasteTransformer,
  ...props
}: OTPProps) {
  const handlePaste: OTPInputProps['pasteTransformer'] = (pasted) =>
    sanitizeOtpValue(pasteTransformer ? pasteTransformer(pasted) : pasted)

  return (
    <InputOTP
      {...props}
      className={className}
      containerClassName={containerClassName}
      disabled={disabled}
      inputMode={inputMode}
      maxLength={length}
      noScriptCSSFallback={null}
      pasteTransformer={handlePaste}
      pattern={REGEXP_ONLY_DIGITS}
      pushPasswordManagerStrategy="none"
      type="text"
    >
      <InputOTPGroup>
        {Array.from({ length }, (_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}
