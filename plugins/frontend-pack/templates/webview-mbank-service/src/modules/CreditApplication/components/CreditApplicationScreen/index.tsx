import { Header } from '@modules/Common'
import { HorizontalStepper } from '@shared/ui/HorizontalStepper'
import { KeyboardAwarePage } from '@shared/ui/KeyboardAwarePage'

import { useCreditApplicationForm } from '../../hooks/useCreditApplicationForm'
import { creditSteps } from '../../model/constants'
import { CreditForm } from '../CreditForm'
import { CreditResult } from '../CreditResult'
import { OtpStep } from '../OtpStep'

export function CreditApplicationScreen() {
  const { isVerifying, otpError, restart, step, verifyOtp, ...form } =
    useCreditApplicationForm()

  if (step === 'done') return <CreditResult onDone={restart} />

  return (
    <KeyboardAwarePage header={<Header />}>
      <HorizontalStepper
        className="py-4"
        current={creditSteps.findIndex((item) => item.id === step)}
        items={creditSteps}
      />
      {step === 'form' ? (
        <CreditForm {...form} />
      ) : (
        <OtpStep
          error={otpError}
          isVerifying={isVerifying}
          onComplete={verifyOtp}
        />
      )}
    </KeyboardAwarePage>
  )
}
