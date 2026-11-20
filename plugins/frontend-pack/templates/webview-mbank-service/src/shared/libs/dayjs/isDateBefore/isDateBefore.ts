import dayjs from 'dayjs'

export const isDateBefore = (
  currentDate: Date,
  targetDate: Date,
  options?: dayjs.OpUnitType,
): boolean => {
  return dayjs(currentDate).isBefore(dayjs(targetDate), options)
}
