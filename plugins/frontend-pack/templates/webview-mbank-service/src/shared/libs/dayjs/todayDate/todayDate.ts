import dayjs from 'dayjs'

import { DateFormats } from '../model'

export const todayDate = (format: string = DateFormats.short_default) => {
  return dayjs().format(format)
}
