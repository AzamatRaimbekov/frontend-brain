export const renderDate = (currentDate: Date) => {
  const day = currentDate.getDay()
  const isSaturday = day === 6
  const isSunday = day === 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isPastDay = currentDate < today
  return (
    <div
      className={'calendar-cell'}
      data-saturday={isSaturday}
      data-sunday={isSunday}
      data-past-day={isPastDay}
    >
      {currentDate.getDate()}
    </div>
  )
}
