import { useSyncExternalStore } from 'react'
import { host, type HostState } from './host'

export { host } from './host'
export type { Host, HostSource, HostState, HostStatus } from './host'
export { LANGS, toLang, type Lang, type Theme } from './protocol'

/** The app state (status, token, language, theme) for components; re-renders on every change. */
export function useHost(): HostState {
  return useSyncExternalStore(host.subscribe, host.getState, host.getState)
}
