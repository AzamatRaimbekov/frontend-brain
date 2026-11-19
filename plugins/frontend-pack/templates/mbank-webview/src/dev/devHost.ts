import { EXPIRED_TOKEN, createMockHost, type MockHost } from '@/shared/bridge/mockHost'
import { findNativePost } from '@/shared/bridge/transports'

let mock: MockHost | null = null

/**
 * Dev only. The fake app, unless the page is opened by the real one (native bridge or #token=…).
 * Cases from the address bar: ?bridge=none (opened in a browser), ?bridge=silent (the app does not answer),
 * ?bridge=expired (the session is over and refresh fails).
 */
export function devHost(): MockHost | undefined {
  if (findNativePost() || window.location.hash.includes('token=')) return undefined
  const scenario = new URLSearchParams(window.location.search).get('bridge')
  if (scenario === 'none') return undefined
  mock = createMockHost(scenario === 'expired' ? { token: EXPIRED_TOKEN, refreshFails: true } : {})
  if (scenario === 'silent') mock.post = () => {}
  return mock
}

export const getDevHost = () => mock
