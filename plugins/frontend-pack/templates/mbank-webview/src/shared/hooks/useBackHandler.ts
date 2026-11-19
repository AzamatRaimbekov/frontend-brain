import { useEffect, useRef } from 'react'
import { host } from '@/shared/bridge'

/**
 * The system "back" of the app (Android button, iOS swipe the app forwards) goes to the newest handler.
 * Return true when the screen used it (closed a sheet, went to the previous step); false passes it on.
 */
export function useBackHandler(handler: () => boolean, enabled = true) {
  const latest = useRef(handler)
  useEffect(() => {
    latest.current = handler
  })
  useEffect(() => {
    if (!enabled) return
    return host.onBack(() => latest.current())
  }, [enabled])
}
