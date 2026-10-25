---
title: Кэш в Next.js менялся трижды — сначала узнай модель проекта, потом пиши fetch
type: gotcha
stack: [next]
tags: [nextjs, cache, use-cache, cache-components, revalidate, fetch, upgrade]
author: AzamatRaimbekov
updated: 2026-10-25
---

## Контекст

Агент или разработчик пишет `fetch` в Server Component «как в прошлом проекте», а данные то не кэшируются,
то кэшируются навсегда, то сборка падает с `blocking-route`. Причина — поведение по умолчанию разное в разных
версиях и режимах:

| Версия / режим | `fetch` в Server Component | Как включить кэш |
|---|---|---|
| Next.js 14 | кэшируется по умолчанию | отключать `cache: 'no-store'` |
| Next.js 15–16 без `cacheComponents` («previous model») | не кэшируется | `next: { revalidate, tags }`, `export const revalidate`, `unstable_cache` |
| Next.js 16 с `cacheComponents: true` | не кэшируется, runtime-данные обязаны быть под `<Suspense>` | `'use cache'` + `cacheLife` + `cacheTag` |

С 16.4 `create-next-app` включает Cache Components по умолчанию, в Next.js 17 это станет поведением по умолчанию.

## Решение

1. Открой `next.config.*`: есть `cacheComponents: true` — пиши только `'use cache'`/`cacheLife`/`cacheTag`,
   `updateTag`/`revalidateTag(tag, 'max')`; нет — только API старой модели. Не смешивай словари в одном проекте.
2. `cookies()`, `headers()`, `params`, `searchParams` и некэшированные запросы при Cache Components — под
   `<Suspense>` или `loading.tsx` сегмента.
3. Перевод существующего приложения на Cache Components — отдельная задача по фичам (официальный скилл
   `next-cache-components-adoption`), а не часть обновления версии.
4. Детали и код: скилл `nextjs`, `references/caching.md`.

## Почему

Одна и та же строка кода даёт разный результат в 14, 15 и 16 + Cache Components. Смешанные API (`export const
revalidate` рядом с `'use cache'`) делают поведение непредсказуемым, а пропущенный `Suspense` ломает сборку.

## Источник

- https://nextjs.org/docs/app/getting-started/caching (проверено 2026-10-25, Next.js 16.4.3)
- https://nextjs.org/docs/app/guides/caching-without-cache-components
- https://nextjs.org/docs/app/guides/upgrading/version-15 (раздел `fetch` requests)
- https://nextjs.org/blog/next-16-4 (рекомендация Cache Components, дефолт в create-next-app, Next.js 17)
