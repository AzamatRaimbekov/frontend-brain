import dayjs from 'dayjs'

import { DateFormats } from '../model'

export const displayDate = (
  date: string | Date | undefined,
  dateFormat: string = DateFormats.full_primary,
) => {
  if (!date) return '-'

  try {
    if (date) {
      const d = dayjs(date)
      if (d.isValid()) {
        return d.format(dateFormat)
      }
    }
  } catch (error) {
    console.error(`${error}`)
    return '-'
  }

  return '-'
}
