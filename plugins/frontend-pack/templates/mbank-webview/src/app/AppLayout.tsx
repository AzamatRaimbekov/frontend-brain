import { useQueryClient } from '@tanstack/react-query'
import { Outlet, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { host } from '@/shared/bridge'
import { OfflineBanner } from '@/shared/components/OfflineBanner'

/** No web header: the app draws its own top bar and back. Only the offline banner and the page. */
export function AppLayout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    // System back with no screen handler: previous page inside the service, else the app closes it.
    host.setFallbackBack(() => {
      if (!router.history.canGoBack()) return false
      router.history.back()
      return true
    })
    // Back from the background (the person paid, switched apps): data may be stale.
    const stopResume = host.onResume(() => void queryClient.invalidateQueries())
    return () => {
      host.setFallbackBack(null)
      stopResume()
    }
  }, [router, queryClient])

  return (
    <>
      <OfflineBanner />
      <Outlet />
    </>
  )
}
