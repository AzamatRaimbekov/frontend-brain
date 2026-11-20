import { NumberSlider } from '@shared/ui/NumberSlider'
import { Segmented } from '@shared/ui/Segmented'

import { Controller } from 'react-hook-form'

import { type CreditApplicationForm } from '../../hooks/useCreditApplicationForm'
import { purposeOptions } from '../../model/constants'
import { PaymentSummary } from '../PaymentSummary'

type CreditConditionsBlockProps = Pick<
  CreditApplicationForm,
  'amount' | 'control' | 'limits' | 'term'
>

export function CreditConditionsBlock({
  amount,
  control,
  limits,
  term,
}: CreditConditionsBlockProps) {
  return (
    <div className="flex flex-col gap-3">
      <Controller
        control={control}
        name="purpose"
        render={({ field }) => (
          <Segmented
            block
            options={purposeOptions}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="amount"
        render={({ field }) => (
          <NumberSlider
            addSymbol="сом"
            sliderLabel="Сумма"
            view="card"
            {...limits.amount}
            value={field.value}
            onChange={(value) => field.onChange(value ?? limits.amount.min)}
          />
        )}
      />
      <Controller
        control={control}
        name="term"
        render={({ field }) => (
          <NumberSlider
            sliderLabel="Срок, месяцев"
            view="card"
            {...limits.term}
            value={field.value}
            onChange={(value) => field.onChange(value ?? limits.term.min)}
          />
        )}
      />
      <PaymentSummary
        amount={amount}
        term={term}
      />
    </div>
  )
}
