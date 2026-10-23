---
title: PWA через vite-plugin-pwa — одна регистрация SW, sw.js без кэша, prompt вместо autoUpdate в формах
type: gotcha
stack: [vite]
tags: [pwa, service-worker, workbox, vite-plugin-pwa, nginx, cache]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

В проекте `VitePWA({ registerType: 'autoUpdate' })` с `injectRegister` по умолчанию уже регистрирует
service worker, а в `main.tsx` есть ещё ручной `navigator.serviceWorker.register('/sw.js')`. Workbox
прекэширует всё до 5 МБ на файл, включая `index.html`, а nginx не отдаёт `sw.js` с `no-cache`. Итог:
пользователи долго сидят на старой версии, а с `autoUpdate` страница может перезагрузиться посреди урока.

## Решение

- Регистрация одна: либо `injectRegister: 'auto'` без ручного `register`, либо `injectRegister: false` и
  `registerSW` из `virtual:pwa-register` с понятным UX «Доступно обновление → Обновить» (тост sonner с действием).
- `registerType: 'prompt'` там, где пользователь что-то вводит (формы, уроки, кабинет). `autoUpdate` —
  только для контентных страниц.
- nginx:

```nginx
location = /sw.js { add_header Cache-Control "no-cache"; }
location = /registerSW.js { add_header Cache-Control "no-cache"; }
location = /manifest.webmanifest { add_header Cache-Control "no-cache"; }
```

- Не прекэшируй тяжёлые картинки и видео: сузь `globPatterns`, остальное — `runtimeCaching`.
- В E2E блокируй SW (`serviceWorkers: 'block'`), иначе тест видит закэшированную сборку.
- PWA с офлайн-данными — только по явному требованию и через persist-плагин Query из `rules/libraries.json`.

## Почему

Обычный баг исправляется следующим релизом. Неправильно настроенный SW делает так, что исправление до
пользователя не доходит.

## Источник

https://vite-pwa-org.netlify.app/guide/register-service-worker.html; найдено на сайте образовательной
платформы (`vite.config.ts`, `main.tsx`, `nginx.conf`), октябрь 2026.
