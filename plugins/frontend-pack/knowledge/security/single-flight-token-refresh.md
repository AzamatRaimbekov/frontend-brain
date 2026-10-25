---
title: Refresh токена на 401 — один общий запрос на все параллельные 401, клон запроса для повтора
type: recipe
stack: [react, vite, next]
tags: [auth, refresh, 401, single-flight, openapi-fetch, middleware, http-client]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Скилл говорит только, что refresh живёт в `shared/api/http.ts`
([api-errors.md](../../skills/react-error-handling/references/api-errors.md)). Без готового рецепта его
пишут заново и ловят гонку: пять запросов одновременно получают 401, уходят пять refresh, сервер ротирует
refresh-токен, второй вызов инвалидирует первый — пользователя выкидывает без видимой причины.

## Решение

Рабочая схема из двух проектов:

1. **Single-flight.** Один промис обновления на всех:

```ts
let inflight: Promise<string | null> | null = null
export const refreshOnce = () => (inflight ??= exchange().finally(() => { inflight = null }))
```

2. **Один повтор, не цикл.** После refresh запрос повторяется ровно один раз; второй 401 →
   `onSessionExpired()` и `ApiError` со статусом 401.
3. **Тело запроса.** Прочитанный `Request` повторно не отправить: в middleware `openapi-fetch` сохраняй
   клон до отправки.

```ts
const copies = new WeakMap<Request, Request>()
const auth: Middleware = {
  onRequest({ request, schemaPath }) {
    if (NO_AUTH.has(schemaPath) || !session.access) return
    const authed = withToken(request, session.access)
    copies.set(authed, authed.clone())
    return authed
  },
  async onResponse({ request, response, schemaPath }) {
    if (response.status !== 401 || NO_AUTH.has(schemaPath)) return
    const copy = copies.get(request)
    if (!copy) return
    const rotated = session.access !== null && session.access !== bearerOf(request)   // сосед уже обновил
    if (!rotated && !(await refreshOnce())) return
    if (session.access) return fetch(withToken(copy, session.access))
  },
}
api.use(auth)
```

4. `/auth/login` и `/auth/refresh` перехватчик не трогает
   ([401-interceptor-skips-auth-endpoints](../errors/401-interceptor-skips-auth-endpoints.md)).
5. Обрыв сети при refresh не стирает сессию; выкидывает только 401 от самого refresh.
6. Восстановление сессии при старте — с таймаутом (около 3–5 с): бэкенд не отвечает → гостевой режим,
   а не вечный лоадер.
7. `http.ts` не импортирует стор: о конце сессии сообщает колбэком или событием, стор подписывается.
   Состояние в React — через `useSyncExternalStore(store.subscribe, store.getState)`.

Где хранить токены — [token-storage-bff](token-storage-bff.md).

## Почему

Клон и single-flight закрывают обе типовые ошибки: повтор с прочитанным телом и шторм refresh-запросов.
Store без React тестируется с подменным `fetch`: можно проверить, что на пять 401 ушёл ровно один refresh.

## Источник

Проверено на SPA в pnpm-монорепо (`features/auth/session-store.ts`, openapi-fetch middleware) и сайте
образовательной платформы (`services/api.ts`), октябрь 2026. https://openapi-ts.dev/openapi-fetch/middleware-auth
