import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { queryClient } from '@/shared/api/queryClient'
import { AppErrorBoundary } from './AppErrorBoundary'
import { HostGate } from './HostGate'
import { router } from './router'

// The fake-app panel exists only in dev with the mock bridge; production bundles do not contain it.
const DevHostPanel = import.meta.env.DEV ? lazy(() => import('@/dev/DevHostPanel')) : null

export function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HostGate>
          <RouterProvider router={router} />
        </HostGate>
      </QueryClientProvider>
      {DevHostPanel && (
        <Suspense fallback={null}>
          <DevHostPanel />
        </Suspense>
      )}
    </AppErrorBoundary>
  )
}
