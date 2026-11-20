import { type CreditApplicationForm } from '../../hooks/useCreditApplicationForm'
import { CreditConditionsBlock } from '../CreditConditionsBlock'
import { CreditDetailsBlock } from '../CreditDetailsBlock'
import { CreditSubmitActions } from '../CreditSubmitActions'

type CreditFormProps = Pick<
  CreditApplicationForm,
  | 'amount'
  | 'control'
  | 'isSubmitting'
  | 'limits'
  | 'onSubmit'
  | 'register'
  | 'term'
>

export function CreditForm({
  amount,
  control,
  isSubmitting,
  limits,
  onSubmit,
  register,
  term,
}: CreditFormProps) {
  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={onSubmit}
    >
      <CreditConditionsBlock
        amount={amount}
        control={control}
        limits={limits}
        term={term}
      />
      <CreditDetailsBlock
        control={control}
        register={register}
      />
      <CreditSubmitActions loading={isSubmitting} />
    </form>
  )
}
