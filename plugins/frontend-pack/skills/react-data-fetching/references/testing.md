# Testing data fetching with MSW

Mock the network, not the hooks. The real `queryOptions`, fetchers, Zod schemas and cache logic
run in tests.

```ts
// src/features/orders/api/orders.handlers.ts (no __mocks__ folder: Vitest reserves it for automocks)
import { http, HttpResponse } from 'msw'; // msw's `http`, not shared/api/http
export const orderHandlers = [
  http.get('*/orders', () => HttpResponse.json([orderFixture()])),
  http.patch('*/orders/:id', async ({ request, params }) =>
    HttpResponse.json({ ...orderFixture({ id: String(params.id) }), ...((await request.json()) as object) })),
];

// src/mocks/handlers.ts - the one list for dev, tests and Storybook
export const handlers = [...orderHandlers /*, ...other features */];

// src/mocks/browser.ts - dev only, started in main.tsx under import.meta.env.DEV
export const worker = setupWorker(...handlers);
// main.tsx: await worker.start({ quiet: true, onUnhandledFrame: 'bypass' })

// src/test/server.ts
export const server = setupServer(...handlers);
// src/test/setup.ts: beforeAll(() => server.listen({ onUnhandledFrame: 'error' })); afterEach(() => server.resetHandlers()); afterAll(() => server.close());

// src/test/render.tsx
export function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  return { queryClient, ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>) };
}
```

Test cases to write for each feature with server state:
- success renders data (`await screen.findByText(...)`)
- error path: `server.use(http.get('*/orders', () => HttpResponse.json({ message: 'x' }, { status: 500 })))`
  shows the error state and retry works
- empty list shows the empty state
- mutation invalidates: after submit, the list shows the new item (override the GET handler)
- optimistic update rolls back on a 4xx/5xx response
- contract break: a response missing a field yields an `ApiError` of kind `contract`

Rules:
- A fresh `QueryClient` per test (no shared cache between tests).
- `retry: false` in tests, otherwise error tests wait for backoff.
- `onUnhandledFrame: 'error'` so unmocked requests fail loudly (MSW v3 name; v3 silently ignores the v2 `onUnhandledRequest`).
- Reuse the same `src/mocks/handlers.ts` in Storybook (`msw-storybook-addon`) and local dev if the backend is not ready; dev scenarios (`?mock=empty|error`) are read by handlers, never by `queryFn` (`react-testing` section 5).
- Existing projects keep their mock layout; new handlers follow it.
