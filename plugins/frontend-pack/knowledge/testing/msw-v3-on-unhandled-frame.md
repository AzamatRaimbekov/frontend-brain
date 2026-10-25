---
title: MSW v3 — onUnhandledRequest переименован в onUnhandledFrame и молча игнорируется
type: gotcha
stack: [react, vite, next]
tags: [msw, vitest, моки, onUnhandledFrame, onUnhandledRequest, setup]
author: AzamatRaimbekov
updated: 2026-10-25
---

## Контекст

В MSW 3 опция для запросов без обработчика называется `onUnhandledFrame`. Старая `onUnhandledRequest`
из v2 больше не существует: TypeScript ругается только если объект опций проверяется типом, а в рантайме
опция просто пропускается. Симптом: тест ходит в сеть без мока и не падает, а в dev консоль засыпана
предупреждениями про запросы к ассетам и навигацию.

## Решение

Смотри версию `msw` в `package.json` и пиши опцию под неё:

```ts
// MSW 3 — тесты (src/test/setup.ts)
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))

// MSW 3 — dev (main.tsx, только под import.meta.env.DEV)
await worker.start({ quiet: true, onUnhandledFrame: 'bypass' })
```

- Значения: `'bypass' | 'warn' | 'error'` или функция `({ frame, defaults }) => ...`, одинаково для
  `worker.start` и `server.listen`.
- Проект на MSW 2: остаётся `onUnhandledRequest`. Обновляя MSW до 3, найди все `onUnhandledRequest`
  (`grep -rn onUnhandledRequest src`) и замени.
- Проверка, что опция работает: временно убери обработчик одного запроса — тест должен упасть.

## Почему

Тест, который тихо уходит в сеть, проходит с выключенной фичей и мигает в CI. Политика команды —
незамоканный запрос в тестах это ошибка (`react-testing`, раздел 6).

## Источник

Типы `msw@3.0.3`: `lib/_chunks/shared-options.d.ts` (`onUnhandledFrame?: UnhandledFrameHandle`).
Найдено при прогоне агента frontend-engineer на демо-проекте заказов, октябрь 2026.
