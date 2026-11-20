export function displayKgzPhone(
  phone: string | null | undefined,
  placeholder: string = '-',
): string {
  if (!phone) return placeholder
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Ensure the number starts with +996 and has 9 digits after the country code
  if (digits.length === 9) {
    return `+996 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  } else if (digits.startsWith('996') && digits.length === 12) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
  }

  return phone // Return as is if it doesn't match expected formats
}
