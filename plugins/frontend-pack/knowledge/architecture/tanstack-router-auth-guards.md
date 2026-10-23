---
title: Стражи маршрутов в TanStack Router — beforeLoad, сессия в context, роли в staticData
type: recipe
stack: [react, vite]
tags: [tanstack-router, auth, guard, roles, beforeLoad, redirect]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Типовые ошибки SPA: после перезагрузки страница с правами мигает или выкидывает на `/login`, пока
токен восстанавливается; проверка роли сделана внутри компонента страницы, а меню показывает пункт,
куда доступа нет.

## Решение

- Сессия передаётся в роутер как context: `createRouter({ routeTree, context: { session, queryClient } })`.
- Страж — фабрика для `beforeLoad`. Сначала ждёт тихого восстановления сессии (single-flight: повторные
  вызовы получают тот же промис), потом проверяет роль чистой функцией.

```ts
export const requireRoles = (roles: readonly Role[]) =>
  async ({ context, location }: { context: RouterContext; location: ParsedLocation }) => {
    await context.session.restore()
    const role = context.session.getState().user?.role ?? null
    const target = guardRedirect(role, roles)          // чистая функция, покрыта юнит-тестом
    if (target) throw redirect({ to: target, search: { from: location.href } })
  }

export const Route = createFileRoute('/_app/orders')({
  staticData: { roles: ORDERS_ROLES },
  beforeLoad: requireRoles(ORDERS_ROLES),
  validateSearch: ordersSearchSchema,                  // Zod-схема с .catch()/default, не регэкспы
  loader: ({ context }) => context.queryClient.ensureQueryData(orderQueries.list()),
})
```

- Роли раздела объявлены один раз в фиче и используются и в страже, и в навигации
  (`staticData.roles` через module augmentation `StaticDataRouteOption`). Пункт меню и доступ не расходятся.
- Пока сессия в статусе `restoring`, корневой layout показывает скелетон, а не форму входа.
- Маршруты — file-based (`src/routes/`), а не один `router.tsx` на 30 маршрутов.

## Почему

Доступ проверяется до рендера и до запросов страницы, правило ролей существует в одном экземпляре.
Сервер всё равно проверяет права на каждом запросе: клиентский страж только скрывает UI.

## Источник

Проверено на SPA в pnpm-монорепо (TanStack Router + Query, openapi-fetch), `src/features/auth/guard.ts`,
октябрь 2026. https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes
