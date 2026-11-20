const full_primary = 'DD.MM.YYYY HH:mm:ss'
const full_default = 'YYYY-MM-DDTHH:mm:ss'
const short_default = 'YYYY-MM-DD'
const calendarFormat = 'DD.MM.YYYY'
const full_secondary = 'YYYY-MM-DD HH:mm:ss'
const full_view_default = 'D MMMM YYYY'
const short_month = 'MMM'

export const DateFormats = {
  full_primary,
  full_default,
  short_default,
  full_secondary,
  full_view_default,
  short_month,
  calendarFormat,
} as const
export type DateFormatsTypes = keyof typeof DateFormats
