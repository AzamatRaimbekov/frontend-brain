import { BridgeError, createChannel, type Channel, type Transport } from './channel'
import { toLang, type HostInfo, type Lang, type Theme } from './protocol'
import { findNativePost, nativeTransport, readLaunchParams } from './transports'

/**
 * connecting — waiting for the app; ready — token in hand; standalone — opened outside the app;
 * failed — the app did not answer `init`; expired — the session is over and refresh did not help.
 */
export type HostStatus = 'connecting' | 'ready' | 'standalone' | 'failed' | 'expired'
export type HostSource = 'native' | 'launch' | 'mock' | 'none'
export type HostState = {
  status: HostStatus
  source: HostSource
  token: string | null
  lang: Lang
  theme: Theme
  platform?: 'ios' | 'android'
}

const systemTheme = (): Theme => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
const initialState = (): HostState => ({
  status: 'connecting',
  source: 'none',
  token: null,
  lang: toLang(navigator.language),
  theme: systemTheme(),
})

export function createHost() {
  let state = initialState()
  let channel: Channel | null = null
  let refreshing: Promise<string | null> | null = null
  const listeners = new Set<() => void>()
  const backHandlers: Array<() => boolean> = []
  const resumeHandlers = new Set<() => void>()
  let fallbackBack: (() => boolean) | null = null
  let lastTransport: Transport | undefined

  const set = (patch: Partial<HostState>) => {
    state = { ...state, ...patch }
    listeners.forEach((listener) => listener())
  }

  const connect = async (transport: Transport, source: HostSource) => {
    channel?.dispose()
    channel = createChannel(transport)
    channel.onEvent((message) => {
      if (message.event === 'lang') set({ lang: toLang(message.data.lang) })
      else if (message.event === 'theme') set({ theme: message.data.theme === 'dark' ? 'dark' : 'light' })
      else if (message.event === 'token' && message.data.token) set({ token: message.data.token, status: 'ready' })
      else if (message.event === 'back') handleBack()
      else if (message.event === 'resume') resumeHandlers.forEach((handler) => handler())
    })
    set({ status: 'connecting', source })
    try {
      const info = await channel.request<HostInfo>('init')
      if (!info?.token) return set({ status: 'expired' })
      set({
        status: 'ready',
        token: info.token,
        lang: toLang(info.lang ?? state.lang),
        theme: info.theme === 'dark' || info.theme === 'light' ? info.theme : state.theme,
        platform: info.platform,
      })
    } catch (error) {
      set({ status: error instanceof BridgeError && error.code === 'unauthorized' ? 'expired' : 'failed' })
    }
  }

  // The newest screen handler wins, then the router (previous page); nobody took it → the app closes the WebView.
  const handleBack = () => {
    for (let i = backHandlers.length - 1; i >= 0; i--) if (backHandlers[i]()) return
    if (fallbackBack?.()) return
    channel?.notify('close')
  }

  /** Picks the way to the app: a given transport (mock), the native bridge, launch params, or none. */
  const start = async (transport?: Transport) => {
    lastTransport = transport
    if (transport) return connect(transport, transport.kind === 'mock' ? 'mock' : 'native')
    const post = findNativePost()
    if (post) return connect(nativeTransport(post), 'native')
    const params = readLaunchParams()
    if (params?.token) {
      return set({
        status: 'ready',
        source: 'launch',
        token: params.token,
        lang: toLang(params.lang ?? state.lang),
        theme: params.theme === 'dark' ? 'dark' : params.theme === 'light' ? 'light' : state.theme,
      })
    }
    set({ status: 'standalone', source: 'none' })
  }

  return {
    getState: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    start,
    /** "Retry" on the failed screen: the same way to the app once more. */
    retry: () => start(lastTransport),

    /** One refresh at a time: parallel 401s wait for the same answer. Null = the session is over. */
    refreshToken(): Promise<string | null> {
      if (!channel) {
        set({ status: 'expired', token: null })
        return Promise.resolve(null)
      }
      refreshing ??= channel
        .request<{ token?: string }>('refreshToken')
        .then((result) => {
          if (!result?.token) throw new BridgeError('no_token')
          set({ token: result.token, status: 'ready' })
          return result.token
        })
        .catch(() => {
          set({ status: 'expired', token: null })
          return null
        })
        .finally(() => {
          refreshing = null
        })
      return refreshing
    },

    /** The API refused even a fresh token: show the "session expired" screen. */
    expire: () => set({ status: 'expired', token: null }),
    close: () => channel?.notify('close'),
    openUrl: (url: string) => (channel ? channel.notify('openUrl', { url }) : window.open(url, '_blank', 'noopener')),
    canClose: () => channel !== null,

    /** Screen-level back handling: return true when the handler used the press. */
    onBack(handler: () => boolean) {
      backHandlers.push(handler)
      return () => {
        const index = backHandlers.lastIndexOf(handler)
        if (index >= 0) backHandlers.splice(index, 1)
      }
    },
    /** What back does when no screen took it: the router sets "previous page if there is one". */
    setFallbackBack(handler: (() => boolean) | null) {
      fallbackBack = handler
    },
    onResume(handler: () => void) {
      resumeHandlers.add(handler)
      return () => resumeHandlers.delete(handler)
    },

    /** Tests only: forget everything. */
    reset() {
      channel?.dispose()
      channel = null
      refreshing = null
      backHandlers.length = 0
      fallbackBack = null
      lastTransport = undefined
      resumeHandlers.clear()
      state = initialState()
      listeners.forEach((listener) => listener())
    },
  }
}

export type Host = ReturnType<typeof createHost>

/** The one host of the page. Components read it through useHost(). */
export const host = createHost()
