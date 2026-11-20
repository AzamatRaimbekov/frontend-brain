import { useState } from 'react'
import { Checkbox } from '@/shared/ui/checkbox'
import { DatePicker } from '@/shared/ui/date-picker'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio'
import { SearchInput } from '@/shared/ui/search-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { Demo, Section } from './Section'
import { previewState } from './showcase/preview-state'
import { StateMatrix } from './showcase/StateMatrix'

const FIELD_STATES = ['default', 'focus', 'disabled'] as const

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export function InputsSection() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 12))
  return (
    <Section id="inputs" title="Поля ввода">
      <Demo title="Input и Select · состояния">
        <StateMatrix
          rows={['input', 'select'] as const}
          states={FIELD_STATES}
          render={(row, state) =>
            row === 'input' ? (
              <Input aria-label={`Input ${state}`} placeholder="CL-240131" {...previewState(state)} />
            ) : (
              <Select disabled={state === 'disabled'}>
                <SelectTrigger aria-label={`Select ${state}`} {...previewState(state === 'disabled' ? '' : state)}>
                  <SelectValue placeholder="Продукт" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumer">Потребительский</SelectItem>
                </SelectContent>
              </Select>
            )
          }
        />
      </Demo>
      <div className="grid gap-4 lg:grid-cols-2">
        <Demo title="Форма заявки">
          <Field id="ds-name" label="ФИО клиента">
            <Input id="ds-name" defaultValue="Абдыкадыров Эрлан" />
          </Field>
          <Field id="ds-amount" label="Сумма, KGS" error="Сумма больше лимита продукта">
            <Input id="ds-amount" aria-invalid aria-describedby="ds-amount-error" defaultValue="12 000 000" />
          </Field>
          <Field id="ds-product" label="Продукт">
            <Select defaultValue="mortgage">
              <SelectTrigger id="ds-product" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consumer">Потребительский</SelectItem>
                <SelectItem value="mortgage">Ипотека</SelectItem>
                <SelectItem value="auto">Автокредит</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field id="ds-date" label="Дата выдачи">
            <DatePicker id="ds-date" value={date} onValueChange={setDate} placeholder="Выберите дату" />
          </Field>
          <Field id="ds-comment" label="Комментарий">
            <Textarea id="ds-comment" placeholder="Причина решения" />
          </Field>
        </Demo>
        <Demo title="Поиск и выбор">
          <SearchInput aria-label="Поиск" placeholder="Номер заявки, ИНН или ФИО" />
          <RadioGroup defaultValue="month" aria-label="Период" className="flex flex-col gap-3">
            {[['week', 'Неделя'], ['month', 'Месяц'], ['quarter', 'Квартал']].map(([value, label]) => (
              <Label key={value} className="gap-2 font-normal">
                <RadioGroupItem value={value} /> {label}
              </Label>
            ))}
          </RadioGroup>
          <Label className="gap-2 font-normal">
            <Checkbox defaultChecked /> Клиент согласен на проверку бюро
          </Label>
          <Label className="gap-2 font-normal">
            <Checkbox disabled /> Недоступно
          </Label>
          <Label className="gap-2 font-normal">
            <Switch defaultChecked /> Уведомлять о просрочке SLA
          </Label>
        </Demo>
      </div>
    </Section>
  )
}
