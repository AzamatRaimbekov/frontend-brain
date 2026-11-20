export const hexColorRegex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/

export function hexToRgba(hex: string, opacity: number = 1): string {
  if (!hexColorRegex.test(hex)) {
    throw new Error('Invalid HEX color format')
  }
  if (opacity < 0 || opacity > 1) {
    throw new Error('Opacity must be between 0 and 1')
  }

  const bigint = parseInt(hex.slice(1), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  // Convert opacity to a 2-digit hexadecimal value
  const alphaHex = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')

  // Return the RGBA hex color
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${alphaHex}`
}
