# Caching and revalidation

Verified against Next.js 16.4.3 (2026-10-25). Two models exist; find out which one the project uses first
(`cacheComponents` in `next.config.*`). Cache Components becomes the default in Next.js 17 and is on by default
for new `create-next-app` projects since 16.4.

## Cache Components (`cacheComponents: true`)

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true, // set it explicitly: unset logs a warning; false only while migrating an older adopter
  output: 'standalone',     // Mdigital self-hosting, see self-hosting.md
}
export default nextConfig
```

Mental model: nothing is cached unless you say so. Each part of a page is one of:

| Part | How | Ends up |
|---|---|---|
| Static (pure render, imports, sync fs) | nothing | static shell at build |
| Cached data/UI | `'use cache'` + `cacheLife` (+ `cacheTag`) | static shell, revalidated by time or tag |
| Request-time (cookies, headers, params, searchParams, uncached fetch, `connection()`) | wrap in `<Suspense>` | streamed hole, fallback is in the shell |

### Data-level cache in a feature's server fetcher

```ts
// src/features/products/api/product.server.ts
import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { http } from '@/shared/api/http'
import { productListSchema } from './product.schemas'

export const productTags = { all: 'products', detail: (id: string) => `product:${id}` }

export async function getProducts() {
  'use cache'
  cacheLife('hours')         // always pair a directive with cacheLife; implicit profile is 'default'
  cacheTag(productTags.all)
  return http('/products', { schema: productListSchema })
}
```

- Arguments and captured variables become the cache key. Return values must be serializable (no `URL`, class
  instances); pass plain strings.
- `'use cache'` functions must not read `cookies()`/`headers()` themselves. Either read outside and pass the value
  as an argument, or use `'use cache: private'` (per-user, can join prefetches).
- `'use cache: remote'` + `cacheHandlers` = a shared persistent store (Redis) for multi-instance self-hosting.
- Default runtime cache is in memory per instance. On several pods the cache is not shared until you configure
  `cacheHandlers` (see self-hosting.md).

### Request-time data under Suspense

```tsx
// app/orders/[id]/page.tsx (thin)
import { Suspense } from 'react'
import { OrderDetails, OrderDetailsSkeleton } from '@/features/orders'

export default function Page({ params }: PageProps<'/orders/[id]'>) {
  return (
    <Suspense fallback={<OrderDetailsSkeleton />}>
      {params.then(({ id }) => <OrderDetails orderId={id} />)}
    </Suspense>
  )
}
```

`await params` at the top of a page is also fine when the segment has `loading.tsx` or the route is covered by
`generateStaticParams`. Without any of these, dev and build report `blocking-route` with three fixes: stream
(`<Suspense>`), cache (`'use cache'`), or block (`export const instant = false`, last resort).

### Random values and time

`Math.random()`, `Date.now()`, `crypto.randomUUID()` need a decision: `await connection()` first (per request, under
Suspense) or put them inside `'use cache'` (shared until revalidation). `performance.now()` is exempt.

### `cacheLife` profiles

| Profile | stale | revalidate | expire |
|---|---|---|---|
| `default` | 5m | 15m | never |
| `seconds` | 30s | 1s | 60s |
| `minutes` | 5m | 1m | 1h |
| `hours` | 5m | 1h | 1d |
| `days` | 5m | 1d | 1w |
| `weeks` | 5m | 1w | 30d |
| `max` | 5m | 30d | 1y |

`seconds`, `revalidate: 0` or `expire` < 5 min are "short-lived": excluded from prerender, they become dynamic holes.
CMS content: `cacheLife('max')` + `cacheTag` + a webhook route handler calling `revalidateTag(tag, 'max')`.

### Invalidation

| API | Where | Behaviour | Use for |
|---|---|---|---|
| `updateTag(tag)` | Server Actions only | expires now; the action's response re-renders with fresh data | user sees own change |
| `revalidateTag(tag, 'max')` | actions, route handlers | stale-while-revalidate, no re-render in the action response | webhooks, background refresh |
| `revalidatePath(path)` | actions, route handlers | all data of a path | no tags available |
| `refresh()` | Server Actions | re-renders current route without touching caches | uncached UI changed |

`revalidateTag(tag)` with one argument is deprecated since 16. Prefer tags over paths. Several self-hosted instances:
tags must be coordinated through the cache handler (`refreshTags`), otherwise other pods keep stale data.

### Static guarantees (16.4)

`export const ensureStatic = 'navigation' | 'prefetch' | 'shell'` in a page or layout fails the build if dynamic
content sneaks in. Use `'navigation'` on marketing/SEO layouts.

## With TanStack Query

The two caches are independent: `'use cache'` is the server cache, TanStack Query the browser cache.

- Server prefetch + `HydrationBoundary` as in `react-data-fetching` references/nextjs.md.
- If the prefetched server data itself is `'use cache'`d, `dehydrate()` reads the current time during prerender:
  follow nextjs.org's "Build a prerenderable hydration state" (cache the timestamp with the same tags).
- After a Server Action mutation: `updateTag` for the server tag and `queryClient.invalidateQueries` (or
  `setQueryData`) for the client key in `onSuccess`. Keep both identities in one place, e.g.
  `productCache = { key, tag, options }` in the feature's `api/`.

## Previous model (no `cacheComponents`)

Next.js 15+ defaults: `fetch` is **not** cached, `GET` route handlers are not cached, client router cache
`staleTime` for pages is 0. Opt in per request or segment:

```ts
await fetch(url, { next: { revalidate: 3600, tags: ['products'] } }) // or cache: 'force-cache'
export const revalidate = 3600       // segment config
export const dynamic = 'force-dynamic'
```

`unstable_cache` for non-fetch data. `cookies()`/`headers()` make the whole route dynamic. Do not add
`'use cache'` here; migrate deliberately (official skill `next-cache-components-adoption`, or the
"Migrating to Cache Components" guide) feature by feature.
