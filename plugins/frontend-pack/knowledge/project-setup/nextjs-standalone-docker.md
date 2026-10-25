---
title: Next.js в Docker — standalone без public и static отдаёт 404, NEXT_PUBLIC_ замерзает в образе
type: gotcha
stack: [next]
tags: [nextjs, docker, nginx, standalone, deploy, env, server-actions, streaming]
author: AzamatRaimbekov
updated: 2026-10-25
---

## Контекст

Компания выкладывает Next.js как Node-сервер в Docker за nginx. Типичные поломки при первом деплое: стили и
картинки 404, сервер недоступен из соседнего контейнера, адрес API «прибит» к стенду сборки, стриминг приходит
одним куском, на двух подах — ошибки «Failed to find Server Action».

## Решение

- `output: 'standalone'` в `next.config`, запуск `node server.js` от пользователя `node`.
- standalone НЕ копирует `public/` и `.next/static` — копируй их в образ сам:
  `COPY .next/standalone ./`, `COPY .next/static ./.next/static`, `COPY public ./public`.
- `ENV HOSTNAME=0.0.0.0 PORT=3000`, иначе сервер слушает только имя контейнера.
- `NEXT_PUBLIC_*` подставляются на `next build`. Для одного образа на все стенды браузер ходит на
  относительный `/api`, nginx проксирует на бэкенд, серверный код читает `process.env` во время запроса.
- nginx: `proxy_buffering off;` (или заголовок `X-Accel-Buffering: no`), прокидывай `Host` и `X-Forwarded-Host` —
  иначе ломаются стриминг и CSRF-проверка Server Actions.
- Больше одного экземпляра: одинаковый `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` на сборке, `deploymentId`,
  общий cache handler (Redis) с `refreshTags`.
- Полный Dockerfile и конфиг nginx: скилл `nextjs`, `references/self-hosting.md`. Для Vite SPA — отдельный рецепт
  `project-setup/docker-nginx-vite-spa`.

## Почему

standalone рассчитан на то, что статику отдаёт CDN; ключ шифрования действий по умолчанию свой на каждую сборку;
кэш по умолчанию в памяти каждого пода. Без этих шагов приложение работает локально и падает на стенде.

## Источник

- https://nextjs.org/docs/app/api-reference/config/next-config-js/output (проверено 2026-10-25)
- https://nextjs.org/docs/app/guides/self-hosting
- https://github.com/vercel/next.js/tree/canary/examples/with-docker (MIT)
- https://nextjs.org/docs/app/guides/environment-variables
