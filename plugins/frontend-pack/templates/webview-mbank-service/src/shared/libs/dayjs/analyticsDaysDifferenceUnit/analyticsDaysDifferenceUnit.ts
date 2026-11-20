import dayjs from 'dayjs'

export const analyticsDaysDifferenceUnit = (
  startDate: string | Date | undefined,
  endDate: string | Date | undefined,
): 'hours' | 'days' | 'months' | undefined => {
  if (!startDate || !endDate) return undefined

  const startDayjs = dayjs(startDate).endOf('day')
  let endDayjs = dayjs(endDate).endOf('day')

  if (!startDayjs.isValid() || !endDayjs.isValid()) {
    console.error('Invalid startDate or endDate')
    return undefined
  }

  if (startDayjs.isSame(endDayjs, 'day')) {
    return 'hours'
  }

  endDayjs = endDayjs.add(1, 'day')

  if (
    !startDayjs.diff(endDayjs, 'month') &&
    endDayjs.date() - startDayjs.date() < endDayjs.daysInMonth()
  ) {
    return 'days'
  }

  return 'months'
}
