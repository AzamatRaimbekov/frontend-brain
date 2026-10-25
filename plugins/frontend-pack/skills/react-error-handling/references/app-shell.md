# App shell states (required in every app)

Every Mdigital app ships these four states from the first commit, before any feature page. A user must never see a white screen, a browser error page or a spinner that never ends.

| State | Vite + TanStack Router | Next.js App Router | Behaviour |
|---|---|---|---|
| Crash | `AppErrorBoundary` + `AppFallback` ([boundaries.md](boundaries.md)) | `global-error.tsx` + `error.tsx` ([nextjs.md](nextjs.md)) | Full page, reload + home, support code |
| Unknown URL | `defaultNotFoundComponent` on the router | `app/not-found.tsx` | Page title, link home, no status code alone |
| Missing entity | `throw notFound()` in the loader | `notFound()` in the page | Same 404 page, the URL stays |
| Offline | `OfflineBanner` in the app layout | same component in the root layout | Banner, cached data stays visible, mutations wait |

## Offline: banner, not a blocking overlay

Cached data is still useful offline (a balance, a list the user already opened), so the app keeps rendering it. TanStack Query already pauses queries and mutations while offline (`networkMode: 'online'`) and resumes them when the connection returns; the UI only has to say so once, at the top.

```ts
// src/shared/hooks/useOnlineStatus.ts
import { onlineManager } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

const subscribe = (onChange: () => void) => onlineManager.subscribe(onChange)

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, () => onlineManager.isOnline(), () => true)
}
```

```tsx
// src/shared/components/OfflineBanner.tsx
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div role="status" className="sticky top-0 z-[var(--z-sticky,50)] bg-status-warning-muted px-4 py-2 text-center text-sm text-status-warning-foreground">
      Нет соединения с интернетом. Показываем сохранённые данные, изменения отправим, когда связь вернётся.
    </div>
  )
}
```

- Put `<OfflineBanner />` once, in the app layout under the providers (it needs `QueryClientProvider` only for consistency with `onlineManager`, which is a singleton).
- Submit buttons of forms that need the server: keep them enabled; a paused mutation shows the pending state and resumes. For actions that must not wait (payment confirmation), disable the button with `!online` and say why next to it.
- Copy goes through i18n keys (`common.offline`) when the project has i18n (`react-security-i18n`).
- Products that are not Mbank: replace the status tokens with the project's warning tokens.

## Not found

```tsx
// src/pages/not-found/NotFoundPage.tsx
import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-md flex-col justify-center gap-3 p-6">
      <h1 className="text-xl font-semibold">Страница не найдена</h1>
      <p className="text-muted-foreground">Проверьте адрес или вернитесь на главную.</p>
      <Link to="/" className="underline">На главную</Link>
    </main>
  )
}
```

```ts
// src/app/router.ts
export const router = createRouter({ routeTree, defaultNotFoundComponent: NotFoundPage, defaultPreload: 'intent' })
```

Next.js: `app/not-found.tsx` with the same content (Server Component, `next/link`).

## Checklist

- [ ] Crash fallback, 404 page and offline banner exist before the first feature page.
- [ ] Opening `/some-unknown-url` shows the 404 page inside the app layout.
- [ ] DevTools → Network → Offline: the banner appears, cached data stays, it disappears when back online.
- [ ] A component that throws shows the crash fallback, not a white screen.
