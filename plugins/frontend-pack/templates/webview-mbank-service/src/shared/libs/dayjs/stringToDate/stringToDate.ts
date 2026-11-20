import dayjs from 'dayjs'

import { DateFormats, DateFormatsTypes } from '../model'

export const stringToDate = (
  date: string,
  dateFormat: DateFormatsTypes = 'full_default',
) => {
  const format = DateFormats[dateFormat]

  if (!date) return ''

  try {
    if (date) {
      const d = dayjs(date, format)
      return d
    }
  } catch (error) {
    console.error(`${error}`)
    return ''
  }

  return ''
}
