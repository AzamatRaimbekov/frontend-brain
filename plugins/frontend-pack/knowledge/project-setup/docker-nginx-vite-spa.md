---
title: Docker + nginx для Vite SPA — один образ на все стенды, адрес бэкенда в рантайме
type: recipe
stack: [vite]
tags: [docker, nginx, deploy, envsubst, proxy, cache, spa]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Типичная выкладка SPA в компании: многостадийный Dockerfile (сборка на node → статика в nginx:alpine),
nginx отдаёт файлы и проксирует `/api` и `/ws` на бэкенд. Во всех трёх изученных проектах схема рабочая,
но с ошибками, которые стоят времени на каждой сборке или белого экрана после релиза.

## Решение

```dockerfile
FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile        # слой кэшируется, пока не изменился lock
COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template   # официальный образ подставит ${ENV}
ENV BACKEND_URL=http://api:8000
HEALTHCHECK CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
```

```nginx
location = /index.html { add_header Cache-Control "no-cache"; }
location / { try_files $uri $uri/ /index.html; add_header Cache-Control "no-cache"; }
location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; try_files $uri =404; }
location /api/ { proxy_pass ${BACKEND_URL}; }
location /ws/ {
  proxy_pass ${BACKEND_URL};
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```

Правила:

- Сначала lock-файл и установка, потом `COPY . .`. Иначе любая правка кода сбрасывает кэш зависимостей.
- `VITE_*` вшиваются на **сборке**. Адрес бэкенда меняй в рантайме через nginx-прокси, в коде пути
  относительные (`/api/...`), в dev то же делает `server.proxy` в `vite.config.ts` — CORS не нужен.
  Нужна runtime-настройка в JS — отдавай `/config.json`, а не build-arg на каждый стенд.
- Если бэкенд может стартовать позже nginx, литерал хоста в `proxy_pass` роняет nginx при старте.
  Тогда — переменная + `resolver` DNS контейнерной сети (`set $backend http://api:8000; proxy_pass $backend;`).
- `npm ci --legacy-peer-deps` прячет конфликты peer-зависимостей; допустим только с комментарием,
  какой пакет его требует.
- Почему `index.html` без кэша: [stale-chunks-after-deploy](../errors/stale-chunks-after-deploy.md).

## Почему

Один неизменяемый образ на все окружения: деплой без пересборки под стенд, откат на любой коммит,
предсказуемый кэш слоёв.

## Источник

Проверено на SPA онбординга, админке и сайте образовательной платформы (Dockerfile, nginx.conf), октябрь 2026.
https://hub.docker.com/_/nginx (раздел «Using environment variables in nginx configuration»).
