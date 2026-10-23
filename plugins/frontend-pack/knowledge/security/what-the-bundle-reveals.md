---
title: Всё в клиентском бандле видит пользователь — VITE_/NEXT_PUBLIC_, «демо-email», dev-коды
type: gotcha
stack: [all]
tags: [env, secrets, vite, next, permissions, dev-only, import-meta-env]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Найдено в проектах:

- ключи API в `VITE_*` и `NEXT_PUBLIC_*` — они вшиваются в JS на сборке;
- `isDemoUser(email)` сравнивает email с захардкоженным адресом и открывает свободную навигацию;
- шаг подтверждения почты показывает `dev_code`, если сервер вернул его в ответе — без проверки режима;
- хост личного туннеля закоммичен в `server.allowedHosts` в `vite.config.ts`.

## Решение

- Секреты только на сервере: Next — server-only переменные (без `NEXT_PUBLIC_`), Server Actions, Route
  Handlers; Vite — за BFF или прокси. `envPrefix` никогда не ставь в `''`.
- `import.meta.env` типизируй в `src/vite-env.d.ts` (`interface ImportMetaEnv`) и проверяй Zod-схемой
  на старте в `src/shared/config/env.ts`.
- Права на функцию (демо, админка, свободная навигация) приходят с сервера флагом в `/me`
  (`capabilities: ['free_nav']`), сервер проверяет их на каждом действии. Клиент только прячет UI.
- Dev-подсказки — только в dev-сборке, тогда код вырезается из прода:

```tsx
{import.meta.env.DEV && devCode ? <DevHint code={devCode} /> : null}
```

- Личные хосты — из env: `allowedHosts: process.env.VITE_ALLOWED_HOSTS?.split(',')`, `.env.local` в `.gitignore`.

## Почему

Логику на клиенте меняют в DevTools за минуту. Если сервер по ошибке начнёт отдавать `dev_code` в проде,
без проверки `DEV` верификация почты перестанет что-то значить. Утечка ключей через бандл — самая частая
находка пентестов фронтенда.

## Источник

https://vite.dev/guide/env-and-mode, https://nextjs.org/docs/app/guides/environment-variables.
Найдено в SPA онбординга (`EmailVerification.tsx`, `vite.config.ts`) и сайте образовательной платформы
(мёртвый `ARG VITE_API_URL`), октябрь 2026.
