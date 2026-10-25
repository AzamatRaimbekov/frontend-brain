---
title: Обновление на Next.js 16 — middleware стал proxy, next lint удалён, params только async
type: gotcha
stack: [next]
tags: [nextjs, upgrade, codemod, proxy, middleware, eslint, turbopack, next-16]
author: AzamatRaimbekov
updated: 2026-10-25
---

## Контекст

После `npm i next@16` проект собирается с предупреждениями или падает: `middleware.ts` deprecated, `next lint`
не найден, синхронные `params`/`cookies()` — ошибки типов, кастомный webpack-конфиг игнорируется.

## Решение

```bash
npx @next/codemod@latest upgrade major          # Next.js, React, React DOM + кодмоды версии
npx @next/codemod@latest next-async-request-api .   # если остался синхронный доступ из эпохи 15
npx @next/codemod@latest middleware-to-proxy .      # middleware.ts -> proxy.ts, export proxy
npx @next/codemod@canary next-lint-to-eslint-cli .  # next lint удалён; lint запускаем в CI сами
```

Дальше вручную по гайду: Node.js ≥ 20.9, TypeScript ≥ 5.1; Turbopack по умолчанию (свой webpack — мигрировать
или `next build --webpack`); `revalidateTag(tag, 'max')` вместо одного аргумента; `images.qualities` по умолчанию
`[75]`; `default.tsx` в каждом слоте параллельных маршрутов; `serverRuntimeConfig` удалён — env-переменные.
Proxy работает только на Node.js runtime, опция `runtime` в нём — ошибка.

Сначала `node <plugin-root>/scripts/nextjs-news.mjs --project .`: покажет текущую версию, гайд и патчи
безопасности. Список целиком: скилл `nextjs`, `references/upgrading.md`.

## Почему

`next build` больше не запускает линтер — без явного шага в CI линт молча пропадает. Proxy — тот же middleware
под новым именем, но старое имя deprecated и уйдёт. Кодмоды закрывают большую часть механики, остальное ловим
грепом и зелёной сборкой.

## Источник

- https://nextjs.org/docs/app/guides/upgrading/version-16 (проверено 2026-10-25)
- https://nextjs.org/docs/app/guides/upgrading/codemods
- https://nextjs.org/docs/app/api-reference/file-conventions/proxy
