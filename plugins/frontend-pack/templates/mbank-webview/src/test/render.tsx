import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import { createAppRouter } from '@/app/router'
import { HostGate } from '@/app/HostGate'
import { host } from '@/shared/bridge'
import { createMockHost, type MockHost } from '@/shared/bridge/mockHost'
import { initI18n } from '@/shared/i18n'

/** Starts the host with a fake app (no delay), then renders the real gate and route tree at `url`. */
export async function renderApp(url = '/', app: Partial<MockHost['state']> = {}) {
  const mock = createMockHost(app, 0)
  await host.start(mock)
  initI18n()
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })
  const router = createAppRouter(createMemoryHistory({ initialEntries: [url] }))
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <HostGate>
        <RouterProvider router={router} />
      </HostGate>
    </QueryClientProvider>,
  )
  return { ...utils, mock, router, queryClient }
}
