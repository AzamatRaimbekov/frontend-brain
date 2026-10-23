# Performance: setup and measurement

## React Compiler setup

Check the installed versions first (`npm ls vite @vitejs/plugin-react`); the setup changed between plugin versions. Follow react.dev "React Compiler - Installation" for the exact current snippet.

**Next.js**

```ts
// next.config.ts
const nextConfig = { reactCompiler: true }
export default nextConfig
```

**Vite with `@vitejs/plugin-react` below v6**: pass the Babel plugin through the React plugin.

```ts
plugins: [react({ babel: { plugins: ['babel-plugin-react-compiler'] } })]
```

**Vite 8 with `@vitejs/plugin-react` v6+**: the `babel` option was removed. The documented setup uses a separate Babel plugin for Rolldown and the preset exported by the React plugin:

```ts
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

plugins: [react(), babel({ presets: [reactCompilerPreset()] })]
```

`@rolldown/plugin-babel` is not yet in `rules/libraries.json`: ask before adding it, and verify the snippet against react.dev for the installed versions.

Lint: `eslint-plugin-react-hooks` with its latest recommended config (flat config preset `recommended-latest` in current versions); uninstall `eslint-plugin-react-compiler` if present.

## Route splitting, Vite + TanStack Router

```ts
// vite.config.ts
import { tanstackRouter } from '@tanstack/router-plugin/vite'
plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react()]
```

The router plugin must come before the React plugin. Check the chunk list in `npm run build` output: each route appears as its own chunk.

## Lazy heavy widget

```tsx
// Vite
const RevenueChart = lazy(() => import('@/features/reports/components/RevenueChart'))
<Suspense fallback={<Delayed><ChartSkeleton /></Delayed>}><RevenueChart data={data} /></Suspense>

// Next.js
const RevenueChart = dynamic(() => import('@/features/reports/components/RevenueChart'), {
  loading: () => <ChartSkeleton />,
})
```

`lazy` needs a default export; keep the named export too for tests (or re-export in a small `RevenueChart.lazy.ts`).

## Virtualized list

```tsx
const parentRef = useRef<HTMLDivElement>(null)
const virtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 48,
  overscan: 8,
})

<div ref={parentRef} className="h-[600px] overflow-auto">
  <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
    {virtualizer.getVirtualItems().map((item) => (
      <OrderRow
        key={rows[item.index].id}
        order={rows[item.index]}
        style={{ position: 'absolute', top: 0, transform: `translateY(${item.start}px)`, width: '100%' }}
      />
    ))}
  </div>
</div>
```

Inline `style` is acceptable here: positions are computed values, not design tokens. Rows of variable height use `measureElement`.

## Lab measurement with Chrome DevTools MCP

1. Build and serve production: `npm run build && npm run preview` (Vite) or `next build && next start`.
2. `new_page` / `navigate_page` to the page URL.
3. `emulate` in one call: mobile viewport (for example `412x915x2.625,mobile,touch`), `cpuThrottlingRate: 4`, `networkConditions: 'Fast 4G'`.
4. `performance_start_trace` with `reload: true`, `ignoreCache: true`; read LCP, CLS and the listed insights; open details with `performance_analyze_insight` (LCP breakdown, render-blocking, layout shift culprits).
5. INP: start a trace with `reload: false, autoStop: false`, perform the main interactions (filter, open dialog, type in search) with `click` / `type_text`, then `performance_stop_trace`; any interaction over 200 ms is a finding.
6. Repeat 3-4 for desktop (no emulation).
7. `lighthouse_audit` (mobile and desktop) for accessibility and best practices; it excludes performance by design.

Report numbers with the conditions (build, device, throttling). Lab numbers are a proxy; the field p75 is the truth.

## Field measurement (RUM)

Requires `web-vitals` (pending approval in `libraries.json`). Sends to our own endpoint; no third-party analytics.

```ts
// src/app/reportWebVitals.ts
import { onCLS, onINP, onLCP, type Metric } from 'web-vitals'
import { env } from '@/shared/config/env'

function send(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name, value: metric.value, rating: metric.rating, id: metric.id,
    page: location.pathname, // path only: no query string (may contain PII)
  })
  const url = `${env.API_URL}/rum/web-vitals`
  if (!navigator.sendBeacon?.(url, body)) void fetch(url, { body, method: 'POST', keepalive: true })
}

export function reportWebVitals() {
  onLCP(send)
  onINP(send)
  onCLS(send)
}
```

Call `reportWebVitals()` once in `src/main.tsx` (Vite) or from a small client component in the root layout (Next.js). The backend aggregates p75 per route and device type.
