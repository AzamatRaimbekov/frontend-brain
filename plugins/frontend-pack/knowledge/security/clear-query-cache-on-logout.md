---
title: При выходе очищай кэш TanStack Query — иначе следующий пользователь увидит чужие данные
type: gotcha
stack: [react, vite, next]
tags: [logout, queryClient, clear, cache, session, privacy]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Выход сделан как `await logout(); navigate({ to: '/login' })`. QueryClient не очищается. Если на том же
компьютере войдёт другой пользователь (оператор после владельца, общий планшет), первые кадры покажут
закэшированные списки прошлой сессии, а запросы со `staleTime` держат их до перезапроса. Правило есть
только в таблице [mutations-and-optimistic.md](../../skills/react-data-fetching/references/mutations-and-optimistic.md),
и в двух проектах из четырёх его не выполнили.

## Решение

Очищай кэш там, где сессия переходит в `anonymous`, — тогда сработает и ручной выход, и протухший refresh:

```ts
// src/app/providers/QueryProvider.tsx
useEffect(
  () => session.subscribe(() => {
    if (session.getState().status === 'anonymous') queryClient.clear()
  }),
  [session, queryClient],
)
```

Минимум — прямо в обработчике выхода: `await logout(); queryClient.clear(); navigate(...)`.
Сторы с UI-состоянием сбрасывай целиком (`reset()`), а не по полям.

Тест: войти пользователем A, загрузить список, выйти, войти B — список A не виден ни на одном кадре
(MSW отдаёт разные данные по токену).

## Почему

Кэш Query живёт дольше сессии. Утечка данных между ролями — одновременно баг безопасности и UX,
и её не видно на демо с одним пользователем.

## Источник

Найдено в SPA в pnpm-монорепо (`features/auth/profile.tsx`, `app/app.tsx`) и SPA онбординга, октябрь 2026.
