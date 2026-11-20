import dayjs, { Dayjs } from 'dayjs'

interface DisabledDateContext {
  from?: Dayjs
}

export const disabledThreeMonth = (
  current: Dayjs,
  { from }: DisabledDateContext,
): boolean => {
  if (!from) return current.isAfter(dayjs())
  return Math.abs(current.diff(from, 'months')) >= 3 || current.isAfter(dayjs())
}
