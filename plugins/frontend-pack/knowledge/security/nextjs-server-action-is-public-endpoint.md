---
title: Server Action — публичный POST-эндпоинт; проверка в proxy.ts или скрытая кнопка не защищают
type: rule
stack: [next]
tags: [nextjs, server-actions, auth, zod, proxy, middleware, idor, security]
author: AzamatRaimbekov
updated: 2026-10-25
---

## Контекст

Форма показывается только авторизованным, `proxy.ts` редиректит без куки — и кажется, что действие защищено.
Но любую экспортированную `'use server'`-функцию можно вызвать POST-запросом напрямую, подставив чужой `id`.

## Решение

Внутри КАЖДОГО действия, в этом порядке:

1. Сессия из серверного слоя (DAL с `import 'server-only'`), не из данных клиента.
2. Zod `safeParse` входа; ожидаемые ошибки — `ActionResult`, не `throw`.
3. Права: запрос к данным с условием владельца (`ownerId = user.id`) или проверка роли. Zod проверяет форму,
   а не право.
4. От клиента берём только id и само изменение; цену, статус, владельца перечитываем на сервере.
5. Возвращаем минимальный DTO, без строк БД и `error.message`.
6. `proxy.ts` — только оптимистичный редирект; авторизацию повторяем в DAL, действиях и route handlers.

Код: скилл `nextjs`, `references/server-actions.md`.

## Почему

Next.js сам проверяет только `Origin` против `Host`, размер тела (1 МБ) и шифрует id действий. Аутентификацию,
авторизацию и валидацию фреймворк не делает. Proxy по документации не предназначен для полноценной авторизации.
Сами Server Actions тоже бывают целью уязвимостей (DoS-advisory октября 2026), поэтому приложения с действиями
держим на последнем патче.

## Источник

- https://nextjs.org/docs/app/guides/server-actions (раздел Security, проверено 2026-10-25)
- https://nextjs.org/docs/app/guides/data-security
- https://nextjs.org/docs/app/getting-started/proxy
- https://nextjs.org/blog/nextjs-security-update-october-14-2026
