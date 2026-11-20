// Demo data: the real limits, rate and cities come from the credit API.
export const creditLimits = { min: 10000, max: 1000000, step: 10000 }
export const termLimits = { min: 3, max: 36, step: 1 }
export const demoYearRate = 0.24
export const demoOtpError = '000000'

export const purposeOptions = [
  { label: 'На любые цели', value: 'consumer' },
  { label: 'На авто', value: 'auto' },
]

export const cityOptions = [
  { label: 'Бишкек', value: 'bishkek' },
  { label: 'Ош', value: 'osh' },
  { label: 'Каракол', value: 'karakol' },
]

export const creditSteps = [
  { id: 'form', title: 'Условия' },
  { id: 'otp', title: 'Код' },
  { id: 'done', title: 'Итог' },
]
