export function formatCentsToCurrencyString(
  amount: number | null | undefined,
): string {
  if (amount === null || amount === undefined) {
    return '-'
  }
  const currency = amount / 100

  const formattedCurrency = currency
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  return `${formattedCurrency}`
}
