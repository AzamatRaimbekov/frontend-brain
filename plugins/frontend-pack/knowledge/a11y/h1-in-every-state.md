---
title: Один h1 на странице во всех состояниях — загрузка, ошибка и 404 тоже
type: gotcha
stack: [react, vite, next]
tags: [h1, заголовки, a11y, loading, error, 404, testing-library, getByRole]
author: AzamatRaimbekov
updated: 2026-10-25
---

## Контекст

Страница рисует `h1` только в ветке с данными. Пока идёт загрузка, при ошибке или 404 заголовка нет —
скринридер не понимает, на какой он странице. Обратная ловушка: `EmptyState`/`ErrorState` рисуют свой
заголовок тем же текстом, что и `h1`, и в тестах `getByRole('heading', { name })` падает с
"Found multiple elements".

## Решение

- Страница рендерит свой `h1` в каждом состоянии: видимый, если он есть в макете, иначе `sr-only`.
- Заголовки `EmptyState`/`ErrorState` — `h2` внутри страницы и отличаются текстом от `h1`.

```tsx
const heading = <h1 className="sr-only">{m.title(orderId)}</h1>
if (isPending) return <>{heading}<OrderDetailsSkeleton /></>
if (isNotFound(error)) return <>{heading}<EmptyState title={m.notFoundTitle} action={toList} /></>
if (isError) return <>{heading}<ErrorState title={m.errorTitle} onRetry={() => refetch()} /></>
```

В тестах ищи состояние по уровню и имени: `findByRole('heading', { level: 2, name: m.notFoundTitle })`,
а `getByRole('heading', { level: 1 })` должен находиться в любом состоянии.

## Почему

Пользователи скринридеров ходят по заголовкам; страница без `h1` в состоянии загрузки или ошибки
выглядит сломанной. Разные имена у заголовков делают и структуру понятной, и запросы в тестах однозначными.

## Источник

Правило — `react-ux` references/async-states.md («One h1 in every state»), `react-page-ux` раздел 2.
Найдено при прогоне агента frontend-engineer на странице заказа демо-проекта, октябрь 2026.
