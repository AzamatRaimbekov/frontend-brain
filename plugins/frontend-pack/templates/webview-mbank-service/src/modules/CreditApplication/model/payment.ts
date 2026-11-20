import { demoYearRate } from './constants'

/** Annuity monthly payment, rounded to whole som. */
export const getMonthlyPayment = (amount: number, months: number) => {
  const rate = demoYearRate / 12
  const payment = (amount * rate) / (1 - (1 + rate) ** -months)
  return Math.round(payment)
}

/** 150000 → "150 000 сом", the same format as InputNumber. */
export const formatSom = (value: number) =>
  `${value.toLocaleString('ru-RU')} сом`
