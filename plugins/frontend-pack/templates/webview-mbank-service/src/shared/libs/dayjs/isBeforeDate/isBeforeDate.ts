import dayjs from 'dayjs'

import { BeforeDateProps } from './types'

export const isBeforeDate = ({
  end_date,
  start_date,
  count = 3,
  type = 'month',
}: BeforeDateProps) => {
  try {
    const today = dayjs(start_date)
    const threeMonthsAgo = dayjs(end_date).subtract(count, type)
    const isMoreThanThreeMonths = today.isBefore(threeMonthsAgo)

    return isMoreThanThreeMonths
  } catch (error) {
    throw new Error(`Error - ${error}`)
  }
}
