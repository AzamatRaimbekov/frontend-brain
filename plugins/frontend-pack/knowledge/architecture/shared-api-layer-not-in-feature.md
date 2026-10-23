---
title: Общий слой API живёт в shared/api, а не в одной из фич; политика повторов — в defaults QueryClient
type: gotcha
stack: [react, vite, next]
tags: [shared-api, ApiError, QueryClient, defaultOptions, retry, imports, boundaries]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

В проекте обёртка, превращающая ответ `openapi-fetch` в результат, вставлена копией в 7 файлов
`features/*/x-api.ts`, и копии уже разошлись (в одной `data ?? null`, в другой `data as T`). Типы ошибок и
маппинг кодов на поля лежат в `features/parks/form-rules`, их глубоким импортом тянут 16 файлов других
фич, а тестовые хелперы этой фичи — ещё 68. `new QueryClient()` создан без `defaultOptions`, поэтому
`retry: false` вписан руками в 54 запроса.

## Решение

- Всё, что не знает о домене, — в `shared`:
  - `shared/api/` — `unwrap()` для openapi-fetch, `ApiError`, `errorBody` ([api-errors.md](../../skills/react-error-handling/references/api-errors.md));
  - `shared/lib/applyServerErrors.ts` — маппинг кодов на поля формы;
  - `shared/test/` — `fakeFetch`, `renderWithProviders`.
- Фича экспортирует только через `index.ts`; глубокие импорты запрещены `import-x/no-restricted-paths`
  ([eslint-config.md](../../skills/react-architecture/references/eslint-config.md)).
- Политика повторов задаётся один раз в `defaultOptions` (готовый вариант — в
  [tanstack-query.md](../../skills/react-error-handling/references/tanstack-query.md)): 4xx (кроме 408 и 429) не повторяем,
  сеть/5xx — до 2 раз. В запросах `retry` пишут только как осознанное исключение.
- Ключи — через фабрику `orderQueries.*` и `queryOptions`, не константой `['products']`.

```ts
export async function unwrap<T>(p: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
  const { data, error, response } = await p
  if (error !== undefined || !response.ok) throw toApiError(response, error)
  return data as T   // единственное место приведения; ответ уже типизирован openapi-typescript
}
```

## Почему

Чужая фича — первый кандидат на скрытый общий код: через полгода её нельзя тронуть, не сломав соседей.
Копии одного хелпера тихо расходятся в поведении, а повторы, вписанные в 54 места, никто не поменяет разом.

## Источник

Найдено в SPA в pnpm-монорепо (TanStack Router + Query, openapi-fetch), `src/features/*/…-api.ts`,
`src/app/app.tsx`, октябрь 2026.
