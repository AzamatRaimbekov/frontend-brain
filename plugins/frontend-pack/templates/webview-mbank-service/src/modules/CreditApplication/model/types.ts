export type CreditStep = 'form' | 'otp' | 'done'

export interface CreditFormValues {
  agree: boolean
  amount: number
  city: string | null
  comment: string
  purpose: string
  term: number
}
