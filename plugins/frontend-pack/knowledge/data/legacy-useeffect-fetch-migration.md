---
title: Миграция useEffect-загрузок на TanStack Query без переписывания — и почему catch(() => {}) врёт пользователю
type: recipe
stack: [react, vite]
tags: [migration, useEffect, fetch, setInterval, useMutation, confirm, legacy]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

В старых проектах данные грузятся так: `useEffect` → `apiFetch().then(setState).catch(() => {})`.
Если API отвечает 500 или истёк токен, таблица показывает пустое состояние — админ видит «нет платежей»
вместо ошибки, в поддержку идут отчёты «данные пропали». Рядом: поллинг через `setInterval` (работает в
фоновых вкладках), мутации через `useState(busy)` + ручной `invalidate` в родителе, удаление через
`confirm()`. Всё это запрещено `rules/libraries.json`, но переписать проект разом нельзя.

## Решение

Переводи по одному экрану, существующий `apiFetch` оставь как fetcher:

1. Чтение: обёртка в `queryOptions` в `features/<f>/api/*.queries.ts`, `signal` пробрасывается.

```ts
export const userQueries = {
  all: () => ['users'] as const,
  list: () => queryOptions({
    queryKey: [...userQueries.all(), 'list'],
    queryFn: ({ signal }) => apiFetch('/admin/users', { signal }).then((r) => usersSchema.parse(r)),
  }),
}
```

2. Поллинг: `refetchInterval: 30_000` в том же `queryOptions` — останавливается в скрытой вкладке,
   дедуплицируется.
3. Мутации: `useMutation` в `features/<f>/api/*.mutations.ts`, инвалидация рядом с мутацией, кнопка
   блокируется по `isPending` ([mutations-and-optimistic.md](../../skills/react-data-fetching/references/mutations-and-optimistic.md)).
4. Пустой `catch(() => {})` запрещён: для чтения — состояние ошибки с «Повторить», для мутации — тост и
   откат ([async-states.md](../../skills/react-ux/references/async-states.md)).
5. `confirm()` и самописные модалки → shadcn `AlertDialog` (фокус-ловушка, возврат фокуса, Escape только
   для верхнего слоя).

Порядок: сначала экраны, где проглоченная ошибка выглядит как «нет данных» (списки, платежи), потом остальное.

## Почему

Проглоченная ошибка неотличима от пустого списка. Ручной `useEffect`-fetch не отменяет запросы и даёт
гонки при быстрой смене фильтра. Поэкранная миграция не останавливает разработку фич.

## Источник

Найдено в админке (6 файлов, 4 пустых catch) и сайте (24 файла, 10 пустых catch) образовательной платформы,
в SPA в pnpm-монорепо (`useMutation` в 2 файлах из ~35 тыс. строк), октябрь 2026.
