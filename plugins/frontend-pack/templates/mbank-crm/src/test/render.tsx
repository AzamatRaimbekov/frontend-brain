import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import { createAppRouter } from '@/app/router'
import { TooltipProvider } from '@/shared/ui/tooltip'

/** Renders the real route tree (CRM layout included) at `url` with a fresh QueryClient. */
export function renderRoute(url: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })
  const router = createAppRouter(createMemoryHistory({ initialEntries: [url] }))
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>,
  )
  return { ...utils, router, queryClient }
}
