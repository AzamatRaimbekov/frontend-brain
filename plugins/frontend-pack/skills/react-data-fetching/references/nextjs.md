# Prefetching: TanStack Router (Vite SPA) and Next.js App Router

## Vite + TanStack Router

```ts
// src/app/router.tsx - the one router config (react-error-handling links here)
import { queryClient } from '@/shared/api/queryClient';
import { RouteErrorComponent } from './RouteErrorComponent';

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',        // preload on hover/focus of <Link>
  defaultPreloadStaleTime: 0,      // let TanStack Query decide freshness, not the router cache
  defaultErrorComponent: RouteErrorComponent, // react-error-handling boundaries.md
  scrollRestoration: true,
});

// src/app/providers.tsx
<QueryClientProvider client={queryClient}>
  <RouterProvider router={router} />
  <ReactQueryDevtools />
</QueryClientProvider>
```

```tsx
// src/routes/orders/$orderId.tsx (thin route file)
export const Route = createFileRoute('/orders/$orderId')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(orderQueries.detail(params.orderId)),
  component: OrderPage,
  pendingComponent: OrderPageSkeleton,
  // no errorComponent: defaultErrorComponent covers it; a custom one would live in pages/
});

// features/orders/components/OrderDetails.tsx
function OrderDetails({ orderId }: { orderId: string }) {
  const { data: order } = useSuspenseQuery(orderQueries.detail(orderId));
  return <OrderCard order={order} />;
}
```

- `ensureQueryData` returns cached data if present, otherwise fetches; the component reads the
  same `queryOptions` so there is no second request.
- For non-critical data use `queryClient.prefetchQuery(...)` without `await` in the loader so the
  route renders immediately and the section suspends.
- Search params that affect data: validate with `validateSearch` (Zod), pass them via
  `loaderDeps` and into the query key.

## Hover / focus prefetch outside links

```tsx
const queryClient = useQueryClient();
<Card onMouseEnter={() => queryClient.prefetchQuery(orderQueries.detail(id))} onFocus={...} />
```

`prefetchQuery` respects `staleTime`, so repeated hovers do not refetch.

## Next.js App Router

This section owns only the TanStack Query side. Framework rules (rendering model, Cache Components,
Server Action security, proxy, self-hosting, upgrades) live in the [nextjs skill](../../nextjs/SKILL.md);
server caching details in [nextjs caching.md](../../nextjs/references/caching.md).

Next.js 16 with `cacheComponents` (default for new apps since 16.4) makes data dynamic by default;
caching on the server is opt-in with `'use cache'`, `cacheLife`, `cacheTag`. TanStack Query is the
client cache; the two layers are independent.

### Query client factory

```ts
// src/shared/api/getQueryClient.ts
import { isServer, QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000 },          // team default; > 0 so the client does not refetch right after hydration
      dehydrate: {                             // sibling of `queries`, not inside it
        shouldDehydrateQuery: (q) => defaultShouldDehydrateQuery(q) || q.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;
export function getQueryClient() {
  if (isServer) return makeQueryClient();     // new client per request on the server
  return (browserQueryClient ??= makeQueryClient());
}
```

Newer v5 docs use `environmentManager.isServer()`; `isServer` still works. Apply the same team defaults (retry, `throwOnError`,
QueryCache/MutationCache handlers) as `shared/api/queryClient.ts`; in Next.js this file replaces the module-level client. The provider is a `'use client'` component in `src/app/providers.tsx`
that calls `getQueryClient()` (not `useState(new QueryClient())` inside a Suspense boundary).

### Prefetch in a Server Component, consume in a Client Component

```tsx
// app/orders/[id]/page.tsx (thin)
export default function Page({ params }: PageProps<'/orders/[id]'>) {
  return (
    <Suspense fallback={<OrderSkeleton />}>                   {/* params is a runtime API: keep it under Suspense */}
      {params.then(({ id }) => <OrderData id={id} />)}
    </Suspense>
  );
}

function OrderData({ id }: { id: string }) {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orderQueries.detail(id));   // not awaited: streams with pending dehydration
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrderDetails orderId={id} />                          {/* 'use client', useSuspenseQuery */}
    </HydrationBoundary>
  );
}
```

`async function Page` with `await params` at the top is equivalent when the segment has `loading.tsx`
(or the previous caching model is used); without a Suspense boundary Cache Components reports `blocking-route`.

- Fetchers used on the server must not rely on browser-only things (cookies are forwarded
  explicitly via `headers()`), or use a server-only fetcher with the same Zod schema.
- If Dates or other non-JSON values are in the cache, configure `serializeData`/`deserializeData`
  (e.g. superjson) on dehydrate/hydrate, or keep dates as strings in schemas used for SSR.
- The server `queryFn` may differ from the client one (a server-only fetcher or a `'use cache'` read) as long as
  the query key and Zod schema are the same. If that read is `'use cache'`d, `dehydrate()` reads the current
  time during prerender: use the "prerenderable hydration state" pattern from the official
  [TanStack Query guide](https://nextjs.org/docs/app/guides/client-side-data-fetching/tanstack-query).

### When not to use TanStack Query in Next.js

- Data shown only by Server Components and never refetched/mutated on the client: fetch it
  directly in the Server Component (through `http()`), optionally with `'use cache'`.
- Do not render the same data in a Server Component and in a client `useQuery`: after a client
  refetch they disagree.

### Mutations in Next.js

- Default: `useMutation` calling a route handler / backend API, invalidating Query keys as usual.
- Server Actions are allowed as the `mutationFn`:
  `useMutation({ mutationFn: updateOrderAction, onSuccess: () => queryClient.invalidateQueries(...) })`.
  In the action call `updateTag`/`revalidatePath` only for data that Server Components render. Auth, ownership
  and Zod inside every action: [nextjs server-actions.md](../../nextjs/references/server-actions.md).
- `useActionState`/`<form action>` without Query: only for simple forms with no client cache
  involvement; `react-ux` (forms, React Hook Form + Zod) and `applyServerErrors` in `react-error-handling` are the default.

### React 19 `use()`

- Allowed: a Server Component starts a promise and passes it to a Client Component that reads it
  with `use(promise)` inside `<Suspense>`.
- Forbidden: creating a promise in a Client Component render and passing it to `use()` - a new
  promise every render means infinite suspense. Use `useSuspenseQuery` instead.
