const phoneRegex = /^\+996\d{9}$/

export const checkPhoneNumber = (phone?: string | null): boolean => {
  return typeof phone === 'string' && phoneRegex.test(phone.trim())
}
