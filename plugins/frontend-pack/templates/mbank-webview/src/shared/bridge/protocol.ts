// Mbank WebView bridge protocol v1 (frontend-pack skills/mbank-webview/references/bridge-protocol.md).
// The app and the page exchange JSON messages; only this folder knows how they travel.

export const PROTOCOL_VERSION = 1
export const LANGS = ['ru', 'ky', 'en'] as const
export type Lang = (typeof LANGS)[number]
export type Theme = 'light' | 'dark'

/** What the app tells the page on start (method `init`). Everything except `token` is optional. */
export type HostInfo = {
  token: string
  lang?: string
  theme?: Theme
  platform?: 'ios' | 'android'
  appVersion?: string
}

/** Page → app. `id` pairs the request with its response. */
export type BridgeRequest = { v: 1; id: string; method: BridgeMethod; params?: Record<string, unknown> }
export type BridgeMethod = 'init' | 'refreshToken' | 'close' | 'openUrl'

/** App → page: a response to a request… */
export type BridgeResponse = { v: 1; id: string; result?: unknown; error?: { code: string; message?: string } }
/** …or an event the app sends on its own. */
export type BridgeEvent =
  | { v: 1; event: 'lang'; data: { lang: string } }
  | { v: 1; event: 'theme'; data: { theme: Theme } }
  | { v: 1; event: 'token'; data: { token: string } }
  | { v: 1; event: 'back' }
  | { v: 1; event: 'resume' }

export type BridgeMessage = BridgeResponse | BridgeEvent

export const TIMEOUTS = { init: 3000, refreshToken: 8000, default: 5000 } as const

/** Unknown or broken languages fall back to Russian, the app's default. */
export function toLang(value: unknown): Lang {
  const short = typeof value === 'string' ? value.slice(0, 2).toLowerCase() : ''
  return (LANGS as readonly string[]).includes(short) ? (short as Lang) : 'ru'
}

/** Parses what the app sent: a string or an object, other versions and junk are ignored (null). */
export function parseMessage(raw: unknown): BridgeMessage | null {
  let value = raw
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return null
    }
  }
  if (!value || typeof value !== 'object') return null
  const message = value as Partial<BridgeResponse & { event: string }>
  if (message.v !== PROTOCOL_VERSION) return null
  if (typeof message.id === 'string' || typeof message.event === 'string') return message as BridgeMessage
  return null
}
