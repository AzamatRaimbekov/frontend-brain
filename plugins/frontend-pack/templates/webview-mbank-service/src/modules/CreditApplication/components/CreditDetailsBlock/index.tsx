import { Checkbox } from '@shared/ui/Checkbox'
import { FloatingLabel } from '@shared/ui/FloatingLabel'
import { Select } from '@shared/ui/Select'
import { Textarea } from '@shared/ui/Textarea'
import { WarningInfo } from '@shared/ui/WarningInfo'

import { Controller } from 'react-hook-form'

import { type CreditApplicationForm } from '../../hooks/useCreditApplicationForm'
import { cityOptions } from '../../model/constants'
import { FieldError } from '../FieldError'

type CreditDetailsBlockProps = Pick<
  CreditApplicationForm,
  'control' | 'register'
>

export function CreditDetailsBlock({
  control,
  register,
}: CreditDetailsBlockProps) {
  return (
    <div className="flex flex-col gap-3">
      <Controller
        control={control}
        name="city"
        rules={{ required: 'Выберите город' }}
        render={({ field, fieldState }) => (
          <div data-field="city">
            <FloatingLabel label="Город">
              <Select
                options={cityOptions}
                placeholder=""
                status={fieldState.error ? 'error' : undefined}
                value={field.value}
                onChange={(value) => field.onChange(value)}
              />
            </FloatingLabel>
            <FieldError message={fieldState.error?.message} />
          </div>
        )}
      />
      <FloatingLabel label="Комментарий">
        <Textarea {...register('comment')} />
      </FloatingLabel>
      <WarningInfo description="Решение придёт в уведомлении в течение 15 минут." />
      <Controller
        control={control}
        name="agree"
        rules={{
          validate: (value) => value || 'Подтвердите согласие с условиями',
        }}
        render={({ field, fieldState }) => (
          <div data-field="agree">
            <Checkbox
              checked={field.value}
              className="text-base leading-5 font-medium text-muted-foreground"
              onChange={field.onChange}
            >
              Согласен(на) с условиями кредитования
            </Checkbox>
            <FieldError message={fieldState.error?.message} />
          </div>
        )}
      />
    </div>
  )
}
