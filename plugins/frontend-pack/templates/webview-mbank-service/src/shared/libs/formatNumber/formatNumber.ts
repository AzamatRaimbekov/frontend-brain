export const formatNumber = (
  number: number | null | undefined,
  options: {
    suffix?: string
    prefix?: string
    toFixed?: number
    placeholder?: string
  } = {},
): string => {
  const {
    suffix = '',
    prefix = '',
    toFixed = null,
    placeholder = '0.00',
  } = options

  if (number && isNaN(number)) {
    return `${prefix}${placeholder}${suffix}`
  }
  if (typeof number === 'number') {
    const formattedNumber =
      toFixed !== null ? number.toFixed(toFixed) : number.toString()

    const [integerPart, decimalPart] = formattedNumber.split('.')
    const groupedInteger = parseInt(integerPart, 10)
      .toLocaleString('ru-RU', { useGrouping: true })
      .replace(/,/g, ' ')

    return `${prefix}${groupedInteger}${decimalPart ? '.' + decimalPart : ''}${suffix}`
  }

  return `${prefix}${placeholder}${suffix}`
}
