import dayjs from 'dayjs'

import { displayDate } from '../displayDate'
import { DateFormats } from '../model'

export const displayDateRange = (
  startDate: string | Date | undefined | null,
  endDate: string | Date | undefined | null,
  format: string = DateFormats.full_view_default,
  isSameUnit: dayjs.UnitType = 'day',
) => {
  try {
    if (startDate && endDate) {
      const startDayjs = dayjs(startDate)
      const endDayjs = dayjs(endDate)
      if (!startDayjs.isValid() || !endDayjs.isValid()) {
        throw new Error('Invalid startDate or endDate')
      }
      const isSameDay = startDayjs.isSame(endDate, isSameUnit)
      return isSameDay
        ? displayDate(startDate, format)
        : `${displayDate(startDate, format)} - ${displayDate(endDate, format)}`
    }
  } catch (error) {
    console.error(error)
    return '-'
  }
}
