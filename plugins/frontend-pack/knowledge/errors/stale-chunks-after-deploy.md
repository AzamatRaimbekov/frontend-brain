---
title: Белый экран после деплоя — index.html без no-cache и lazy-маршруты без boundary
type: gotcha
stack: [vite, react]
tags: [deploy, nginx, lazy, chunk, preloadError, error-boundary, cache-control]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

SPA с маршрутами через `lazy()`. nginx отдаёт `/assets/` с `immutable` на год, а для `index.html`
заголовок не задан. После деплоя у пользователя с открытой вкладкой или закэшированным `index.html`
остаются ссылки на старые чанки, которых уже нет на сервере:
`Failed to fetch dynamically imported module` → белый экран, потому что над `<Suspense>` нет
error boundary. Встречено в трёх проектах из четырёх изученных.

## Решение

1. nginx: точку входа не кэшировать, хэшированные ассеты — навсегда.

```nginx
location = /index.html { add_header Cache-Control "no-cache"; }
location / { try_files $uri $uri/ /index.html; add_header Cache-Control "no-cache"; }
location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; try_files $uri =404; }
```

2. `main.tsx`: при ошибке предзагрузки Vite перезагрузить страницу один раз.

```ts
window.addEventListener('vite:preloadError', (event) => {
  try {
    if (sessionStorage.getItem('chunk-reload')) return   // защита от бесконечного цикла
    sessionStorage.setItem('chunk-reload', '1')
  } catch { return }
  event.preventDefault()
  location.reload()
})
```

Флаг сбрасывай после успешной загрузки приложения (`sessionStorage.removeItem('chunk-reload')` в корне).

3. Над каждым ленивым маршрутом — `ErrorBoundary` из `react-error-boundary` с кнопкой «Обновить»
   (слои boundary: [boundaries.md](../../skills/react-error-handling/references/boundaries.md)).

## Почему

Кэшировать хэшированные файлы навсегда можно только при условии, что точка входа всегда свежая.
`vite:preloadError` — официальный хук Vite именно для этого случая; это не глобальный `window.onerror`,
поэтому не дублирует отчёты об ошибках.

## Источник

https://vite.dev/guide/build#load-error-handling. Найдено в SPA онбординга, админке и сайте
образовательной платформы (nginx без Cache-Control), октябрь 2026.
