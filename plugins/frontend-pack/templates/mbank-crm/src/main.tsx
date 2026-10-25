import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppErrorBoundary } from '@/app/AppErrorBoundary'
import { router } from '@/app/router'
import { queryClient } from '@/shared/api/queryClient'
import { TooltipProvider } from '@/shared/ui/tooltip'
import './index.css'

// Dev API lives in MSW (src/mocks) until the backend exists. VITE_API_MOCKS=off uses the real API.
async function enableMocks() {
  if (!import.meta.env.DEV || import.meta.env.VITE_API_MOCKS === 'off') return
  const { worker } = await import('./mocks/browser')
  // MSW 3: onUnhandledFrame (onUnhandledRequest is ignored). bypass = pages and assets go to Vite.
  await worker.start({ quiet: true, onUnhandledFrame: 'bypass' })
}

enableMocks().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <RouterProvider router={router} />
          </TooltipProvider>
        </QueryClientProvider>
      </AppErrorBoundary>
    </StrictMode>,
  )
})
