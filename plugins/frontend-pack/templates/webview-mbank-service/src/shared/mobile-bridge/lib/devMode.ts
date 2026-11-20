export type MobileBridgeDevMode = 'native' | 'mock' | 'disabled'

export const mobileBridgeDevModeQueryKey = 'mbankBridge'

const mockModeValues = new Set(['mock', '1', 'true'])
const disabledModeValues = new Set(['disabled', 'off', '0', 'false'])

const isLocalhost = (hostname: string) =>
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '0.0.0.0' ||
  hostname === '::1'

export const getMobileBridgeDevMode = (): MobileBridgeDevMode => {
  if (typeof window === 'undefined') {
    return 'native'
  }

  const value = new URLSearchParams(window.location.search)
    .get(mobileBridgeDevModeQueryKey)
    ?.toLowerCase()

  if (value && mockModeValues.has(value)) {
    return 'mock'
  }

  if (value && disabledModeValues.has(value)) {
    return 'disabled'
  }

  return isLocalhost(window.location.hostname) ? 'mock' : 'native'
}

export const shouldBypassMobileBridge = () =>
  getMobileBridgeDevMode() !== 'native'
