import type { Transport } from './channel'
import type { BridgeEvent, BridgeRequest, HostInfo, Theme } from './protocol'

type EventBody = { [K in BridgeEvent['event']]: Omit<Extract<BridgeEvent, { event: K }>, 'v'> }[BridgeEvent['event']]

/** A fake Mbank app inside the page for development and tests: answers requests, sends events on demand. */
export type MockHost = Transport & {
  state: HostInfo & { refreshFails: boolean; closed: boolean; opened: string[] }
  emit: (event: EventBody) => void
  setLang: (lang: string) => void
  setTheme: (theme: Theme) => void
  expireToken: () => void
  setRefreshFails: (fails: boolean) => void
}

export const MOCK_TOKEN_PREFIX = 'mock-token-'
export const EXPIRED_TOKEN = 'mock-expired'

export function createMockHost(initial: Partial<MockHost['state']> = {}, delayMs = 150): MockHost {
  const receivers = new Set<(raw: unknown) => void>()
  let refreshes = 0
  const state: MockHost['state'] = {
    token: `${MOCK_TOKEN_PREFIX}0`,
    lang: 'ru',
    theme: 'light',
    platform: 'ios',
    appVersion: 'mock',
    refreshFails: false,
    closed: false,
    opened: [],
    ...initial,
  }
  const deliver = (message: unknown) => window.setTimeout(() => receivers.forEach((r) => r(message)), delayMs)

  const answer = (request: BridgeRequest) => {
    switch (request.method) {
      case 'init': {
        const { token, lang, theme, platform, appVersion } = state
        return deliver({ v: 1, id: request.id, result: { token, lang, theme, platform, appVersion } })
      }
      case 'refreshToken':
        if (state.refreshFails) return deliver({ v: 1, id: request.id, error: { code: 'unauthorized' } })
        state.token = `${MOCK_TOKEN_PREFIX}${++refreshes}`
        return deliver({ v: 1, id: request.id, result: { token: state.token } })
      case 'close':
        state.closed = true
        return
      case 'openUrl':
        state.opened.push(String(request.params?.url ?? ''))
        return
    }
  }

  const host: MockHost = {
    kind: 'mock',
    state,
    post: answer,
    listen(receive) {
      receivers.add(receive)
      return () => receivers.delete(receive)
    },
    emit: (event) => deliver({ v: 1, ...event }),
    setLang(lang) {
      state.lang = lang
      host.emit({ event: 'lang', data: { lang } })
    },
    setTheme(theme) {
      state.theme = theme
      host.emit({ event: 'theme', data: { theme } })
    },
    setRefreshFails(fails) {
      state.refreshFails = fails
    },
    // The next API call gets 401; refresh then succeeds unless refreshFails is set.
    expireToken() {
      state.token = EXPIRED_TOKEN
      host.emit({ event: 'token', data: { token: EXPIRED_TOKEN } })
    },
  }
  return host
}
