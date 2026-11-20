import { useState } from 'react'
import { type FieldErrors, useForm, useWatch } from 'react-hook-form'

import { creditLimits, demoOtpError, termLimits } from '../model/constants'
import { type CreditFormValues, type CreditStep } from '../model/types'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const defaultValues: CreditFormValues = {
  agree: false,
  amount: 150000,
  city: null,
  comment: '',
  purpose: 'consumer',
  term: 12,
}

const fieldOrder: (keyof CreditFormValues)[] = [
  'purpose',
  'amount',
  'term',
  'city',
  'comment',
  'agree',
]

// Forms rule: after an invalid submit the person is taken to the first error.
const scrollToFirstError = (errors: FieldErrors<CreditFormValues>) => {
  const first = fieldOrder.find((name) => errors[name])
  if (!first) return
  document
    .querySelector(`[data-field="${first}"]`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

/** Credit application flow: form → SMS code → result. API calls are mocked. */
export const useCreditApplicationForm = () => {
  const [step, setStep] = useState<CreditStep>('form')
  const [otpError, setOtpError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const form = useForm<CreditFormValues>({ defaultValues })
  const [amount, term] = useWatch({
    control: form.control,
    name: ['amount', 'term'],
  })

  const onSubmit = form.handleSubmit(async () => {
    await wait(800)
    setStep('otp')
  }, scrollToFirstError)

  const verifyOtp = async (code: string) => {
    setOtpError(false)
    setIsVerifying(true)
    await wait(800)
    setIsVerifying(false)
    if (code === demoOtpError) {
      setOtpError(true)
      return
    }
    setStep('done')
  }

  const restart = () => {
    form.reset(defaultValues)
    setOtpError(false)
    setStep('form')
  }

  return {
    amount,
    control: form.control,
    isSubmitting: form.formState.isSubmitting,
    isVerifying,
    limits: { amount: creditLimits, term: termLimits },
    onSubmit,
    otpError,
    register: form.register,
    restart,
    step,
    term,
    verifyOtp,
  }
}

export type CreditApplicationForm = ReturnType<typeof useCreditApplicationForm>
