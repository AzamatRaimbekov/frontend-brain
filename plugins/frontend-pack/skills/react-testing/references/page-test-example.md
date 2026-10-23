# Page test with MSW: full example

A Vite + TanStack Router page `OrdersPage` with a list (query) and a create form (mutation). The handler layout, `server.ts` and `renderWithClient` are owned by `react-data-fetching` [testing.md](../../react-data-fetching/references/testing.md); this file adds the routed render helper, the i18n guard and the four state tests.

## vitest.setup.ts

```ts
import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, expect } from 'vitest'
import { cleanup } from '@testing-library/react'
import { i18n } from '@/shared/config/i18n'
import { server } from './src/test/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

// Fail the test that rendered a key missing from the ru resources.
// The 'missingKey' event fires only with saveMissing: true. It is switched on here, after the app's
// init, by mutating the shared instance's options: the translator reads the same options object.
// Keys use the pack's one-namespace form (t('orders.empty.title')), see react-security-i18n i18n.md.
const missingKeys: string[] = []
i18n.options.saveMissing = true
i18n.on('missingKey', (_lngs, _ns, key) => missingKeys.push(key))
afterEach(() => {
  expect(missingKeys, 'missing i18n keys').toEqual([])
  missingKeys.length = 0
})
```

`cleanup()` is explicit because `globals: false` disables Testing Library's auto-cleanup. File name and MSW lines match `react-data-fetching` [testing.md](../../react-data-fetching/references/testing.md) (`vitest.setup.ts`). The i18n instance, its `ru` default and the one-namespace key form (`orders.*`, `errors.*`, `common.*` all in `translation`) come from `react-security-i18n` [i18n.md](../../react-security-i18n/references/i18n.md).

## src/test/render.tsx (routed render)

```tsx
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'

function createTestQueryClient() {
  // same options as renderWithClient in react-data-fetching testing.md
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })
}

/** Renders the real route tree at `url`, so validateSearch, loaders and links work. */
export function renderRoute(url: string) {
  const queryClient = createTestQueryClient()
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [url] }),
    context: { queryClient }, // only if the root route is created with createRootRouteWithContext
  })
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { ...utils, router, queryClient }
}
```

Next.js: render the page's client component with `renderWithClient` and mock only `next/navigation` (`useRouter`, `useSearchParams`) with `vi.mock('next/navigation', ...)`. With `nuqs`, wrap the render in nuqs' testing adapter (`NuqsTestingAdapter` from `nuqs/adapters/testing`, `searchParams` prop for the initial URL) so URL state works without Next.

## src/features/orders/api/__mocks__/order.handlers.ts

```ts
import { delay, http, HttpResponse } from 'msw'
import type { Order } from '../order.schemas'

export const orderFixture = (over: Partial<Order> = {}): Order => ({
  id: 'o-1',
  number: 'A-1001',
  status: 'open',
  total: 1500,
  ...over,
})

export const orderHandlers = [
  http.get('*/orders', () => HttpResponse.json({ items: [orderFixture()], total: 1 })),
  http.post('*/orders', async ({ request }) =>
    HttpResponse.json(orderFixture({ id: 'o-2', ...((await request.json()) as object) }), { status: 201 })),
]

// Scenario helpers keep tests short and identical across features
export const ordersLoadingForever = http.get('*/orders', async () => {
  await delay('infinite')
  return HttpResponse.json({ items: [], total: 0 })
})
export const ordersEmpty = http.get('*/orders', () => HttpResponse.json({ items: [], total: 0 }))
export const ordersServerError = http.get('*/orders', () =>
  HttpResponse.json({ code: 'internal' }, { status: 500 }))
export const createOrderEmailTaken = http.post('*/orders', () =>
  HttpResponse.json({ errors: { email: ['orders.form.email.taken'] } }, { status: 422 }))
```

The 422 body matches the default `errorBodySchema` (`errors` record) in `react-error-handling` [api-errors.md](../../react-error-handling/references/api-errors.md); adapt both together if the backend contract differs.

## src/pages/orders/OrdersPage.test.tsx

```tsx
import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { renderRoute } from '@/test/render'
import { i18n } from '@/shared/config/i18n'
import {
  createOrderEmailTaken, orderFixture, ordersEmpty, ordersLoadingForever, ordersServerError,
} from '@/features/orders/api/__mocks__/order.handlers'

const t = i18n.t.bind(i18n)

describe('OrdersPage', () => {
  it('shows a skeleton while orders load', async () => {
    server.use(ordersLoadingForever)
    renderRoute('/orders')
    expect(await screen.findByTestId('orders-skeleton')).toBeInTheDocument() // appears after Delayed (250 ms)
    expect(screen.queryByText(t('orders.empty.title'))).not.toBeInTheDocument()
  })

  it('shows the empty state with a create action when there are no orders', async () => {
    server.use(ordersEmpty)
    renderRoute('/orders')
    expect(await screen.findByText(t('orders.empty.title'))).toBeVisible()
    expect(screen.getByText(t('orders.empty.description'))).toBeVisible()
    expect(screen.getByRole('button', { name: t('orders.create') })).toBeVisible()
  })

  it('shows an error with Retry on 500 and recovers after retry', async () => {
    server.use(ordersServerError)
    const user = userEvent.setup()
    renderRoute('/orders')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(t('errors.loadFailed.title'))

    server.resetHandlers() // next request uses the default success handler
    await user.click(within(alert).getByRole('button', { name: t('common.retry') }))
    expect(await screen.findByText('A-1001')).toBeVisible()
  })

  it('restores filters from the URL', async () => {
    server.use(http.get('*/orders', ({ request }) => {
      const status = new URL(request.url).searchParams.get('status')
      return HttpResponse.json({ items: [orderFixture({ status: status as 'closed' })], total: 1 })
    }))
    renderRoute('/orders?status=closed')
    expect(await screen.findByRole('radio', { name: t('orders.filter.closed') })).toBeChecked()
  })

  it('puts a 422 server error on the email field and keeps the input', async () => {
    server.use(createOrderEmailTaken)
    const user = userEvent.setup()
    renderRoute('/orders/new')
    const email = await screen.findByLabelText(t('orders.form.email.label'))
    await user.type(email, 'a@b.kg')
    await user.type(screen.getByLabelText(t('orders.form.quantity.label')), '2')
    await user.click(screen.getByRole('button', { name: t('orders.create') }))

    expect(await screen.findByText(t('orders.form.email.taken'))).toBeVisible()
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveFocus()          // applyServerErrors focuses the first matched field
    expect(email).toHaveValue('a@b.kg')  // never reset on error
  })
})
```

Notes:
- Keys like `orders.empty.title` and test ids like `orders-skeleton` are the page's own; the shape of the tests is the rule, not these names.
- If the create button also exists in the page header, scope the query with `within(...)` on the empty-state container (`role="status"` in `react-ux` async-states.md).
- Whether the field message is the raw server key or a mapped text depends on the backend contract (see `applyServerErrors` notes in `react-error-handling`). Assert on what the user actually sees.
- The 422 path must not also toast: the mutation sets `meta: { skipGlobalErrorToast: true }` (`react-error-handling` section 7). If the test renders the app's `<Toaster />`, assert the error text appears exactly once.
