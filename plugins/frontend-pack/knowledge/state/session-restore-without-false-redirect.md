---
title: Восстановление сессии — статус unknown до редиректа, без setState в рендере и без ручного таймера
type: gotcha
stack: [react, vite]
tags: [auth, guard, hydration, protected-route, redirect, f5]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Два варианта одной ошибки из разных проектов:

- Стор стартует с `isAuthenticated: false`, токен читается из `sessionStorage` в `useEffect` в `App`.
  При F5 на `/users` первый рендер видит `false`, `ProtectedRoute` делает `<Navigate to="/login">`, потом
  гидрация ставит `true`, но пользователь уже на форме входа. Тесты не ловят: они выставляют стор вручную.
- Гард копирует `useMe()` в стор через `useEffect`, а по таймауту зовёт `store.setState({ hydrated: true })`
  прямо в теле рендера. Это побочный эффект в рендере (в StrictMode дважды, предупреждение
  «Cannot update a component while rendering a different component»), а таймер не отменяет запрос.

## Решение

1. Токен в синхронном хранилище — читай его в инициализаторе стора, а не в эффекте:

```ts
const initial = safeRead(TOKEN_KEY)   // try/catch вокруг sessionStorage
export const useAuth = create<AuthState>()(() => ({ token: initial, isAuthenticated: !!initial }))
```

2. Сессия проверяется запросом (`/me`, refresh-cookie) — гард читает только состояние запроса,
   а таймаут живёт в самом fetch:

```ts
export const meQueries = {
  current: () => queryOptions({
    queryKey: ['me'], retry: false, staleTime: 5 * 60_000,
    queryFn: ({ signal }) => http('/me', { schema: meSchema, signal, timeoutMs: 8000 }),
  }),
}
export function RequireAuth({ children }: { children: ReactNode }) {
  const me = useQuery(meQueries.current())
  const location = useLocation()
  if (me.isPending) return <BootSkeleton />
  if (me.isError) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}
```

3. Страница `/login` уводит уже вошедшего пользователя на `from` или `/`.
4. Тест: положить токен в storage, отрендерить `<App />` на защищённом маршруте, контент виден.

В TanStack Router то же делается в `beforeLoad`: [tanstack-router-auth-guards](../architecture/tanstack-router-auth-guards.md).

## Почему

Эффекты выполняются после рендера, а `Navigate` — во время. Любое восстановление без промежуточного
состояния даёт ложный редирект. Таймаут в `fetch` (`AbortSignal.timeout`) реально обрывает запрос и
сам переводит его в ошибку — флаг `hydrated` не нужен.

## Источник

Найдено в админке образовательной платформы (`App.tsx`, `ProtectedRoute.tsx`) и SPA онбординга
(`components/auth/AuthGate.tsx`), октябрь 2026.
