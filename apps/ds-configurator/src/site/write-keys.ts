// Write keys of projects in this browser (the server keeps only a hash). useWriteKey re-renders
// every user of a key when it is saved or replaced.
import { useSyncExternalStore } from "react"

const PREFIX = "ds-site:key:"
const listeners = new Set<() => void>()

export function readWriteKey(id: string): string | null {
  try {
    return localStorage.getItem(PREFIX + id)
  } catch {
    return null
  }
}

export function saveWriteKey(id: string, key: string) {
  try {
    if (key) localStorage.setItem(PREFIX + id, key)
    else localStorage.removeItem(PREFIX + id)
  } catch {
    // private mode: the key lives only until reload
  }
  for (const l of listeners) l()
}

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const useWriteKey = (id: string) => useSyncExternalStore(subscribe, () => readWriteKey(id), () => null)
