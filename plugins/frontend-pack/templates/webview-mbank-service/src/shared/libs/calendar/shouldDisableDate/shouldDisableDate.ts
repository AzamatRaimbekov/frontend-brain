export const shouldDisableDate = (date: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const day = date.getDay()
  const isWeekend = day === 0 || day === 6
  if (isWeekend) return true
  if (date < today) return true
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  if (date < currentMonthStart) return true
  return false
}
