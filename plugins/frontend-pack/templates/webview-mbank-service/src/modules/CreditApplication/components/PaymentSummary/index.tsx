import { ListDescription } from '@shared/ui/ListDescription'

import { formatSom, getMonthlyPayment } from '../../model/payment'

interface PaymentSummaryProps {
  amount: number
  term: number
}

export function PaymentSummary({ amount, term }: PaymentSummaryProps) {
  const monthly = getMonthlyPayment(amount, term)

  return (
    <ListDescription
      className="rounded-[20px] bg-card px-4"
      list={[
        {
          key: 'monthly',
          title: 'Платёж в месяц',
          description: formatSom(monthly),
        },
        {
          key: 'total',
          title: 'Всего к возврату',
          description: formatSom(monthly * term),
        },
      ]}
    />
  )
}
