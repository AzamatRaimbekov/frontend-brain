export const calculateAnnuityPayment = (
  amount: number,
  annualRate: number,
  months: number,
) => {
  if (!amount || !annualRate || !months) return 0

  const monthlyRate = annualRate / 100 / 12
  const coefficient =
    (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)

  return amount * coefficient
}

export const calculateDownPaymentPercent = (
  price: number | null,
  initialPayment: number | null,
): number => {
  if (!price || !initialPayment) return 0
  if (price === 0) return 0
  const percentage = (initialPayment / price) * 100
  return Math.floor(percentage)
}

export function getMaxDownPayment(
  price: number | null,
  maxPercent: number | null,
): number {
  if (!price || !maxPercent) return 1
  return Math.floor((price * maxPercent) / 100)
}
