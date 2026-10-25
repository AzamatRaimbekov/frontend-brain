import { KeyValueRow } from '@/shared/components/crm/KeyValueRow'
import { KeyValueSection } from '@/shared/components/crm/KeyValueSection'
import type { Application } from '../api/schemas'
import { formatMoney, formatPercent, formatTerm } from '../lib/format'

/** Left column of the Figma frame: Заёмщик, Параметры кредита, Документы. */
export function ApplicationSections({ application: a }: { application: Application }) {
  const term = formatTerm(a.termMonths)
  return (
    <>
      <KeyValueSection title="Заёмщик">
        <KeyValueRow label="ФИО">{a.borrower.fullName}</KeyValueRow>
        <KeyValueRow label="ИНН">{a.borrower.innMasked}</KeyValueRow>
        <KeyValueRow label="Телефон">
          <a href={`tel:${a.borrower.phone.replace(/\s/g, '')}`} className="hover:underline">
            {a.borrower.phone}
          </a>
        </KeyValueRow>
        <KeyValueRow label="Работа">{a.borrower.employment}</KeyValueRow>
      </KeyValueSection>
      <KeyValueSection title="Параметры кредита">
        <KeyValueRow label="Продукт">{a.product}</KeyValueRow>
        <KeyValueRow label="Сумма и срок">{[formatMoney(a.amount, a.currency), term].filter(Boolean).join(' · ')}</KeyValueRow>
        <KeyValueRow label="Ставка">
          {[a.rate !== null && `${formatPercent(a.rate)} годовых`, a.loan.effectiveRate !== null && `ЭПС ${formatPercent(a.loan.effectiveRate)}`]
            .filter(Boolean)
            .join(' · ') || '—'}
        </KeyValueRow>
        <KeyValueRow label="Платёж в месяц">
          {formatMoney(a.loan.monthlyPayment, a.currency)} · {formatPercent(a.loan.debtToIncome)} дохода
        </KeyValueRow>
      </KeyValueSection>
      <KeyValueSection title="Документы">
        {a.documents.map((doc) => (
          <KeyValueRow key={doc.id} label={doc.label} tone={doc.problem ? 'error' : 'default'}>
            {doc.value}
          </KeyValueRow>
        ))}
      </KeyValueSection>
    </>
  )
}
