import { displayField } from '../displayField'
import { formatNumber } from '../formatNumber'

export const thousandSeparatorRegex = /\B(?=(\d{3})+(?!\d))/g
export function displaySum(
  value: number | string | null | undefined,
  placeholder: string = '0.00',
  toFixed: number = 2,
) {
  if (typeof value === 'string') {
    const formattedValue = value.replace(thousandSeparatorRegex, ' ')
    return displayField(formattedValue, {
      suffix: ' KGS',
      placeholder,
    }).toString()
  }

  return formatNumber(value, {
    suffix: ' KGS',
    toFixed,
    placeholder,
  })
}

export function displayIntegerSum(value: number | string | null | undefined) {
  return displaySum(value, '', 0)
}
