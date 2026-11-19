import { onlineManager } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

const subscribe = (onChange: () => void) => onlineManager.subscribe(onChange)

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, () => onlineManager.isOnline(), () => true)
}
