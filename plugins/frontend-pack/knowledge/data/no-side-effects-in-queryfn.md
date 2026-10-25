---
title: queryFn только загружает и валидирует — не пиши в модульные переменные и сторы
type: gotcha
stack: [all]
tags: [tanstack-query, queryFn, side-effects, useMemo, react-compiler]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Хук `useStages` внутри `queryFn` вызывает `setActiveStages(stages)`, то есть пишет в модульную
`let activeStages`. Её читают чистые функции стора (подсчёт XP, статусы этапов). Чтобы компонент
пересчитался, `stages` кладут в deps `useMemo`, хотя внутри не используют:
`useMemo(() => getAllStatuses(done, pending), [done, pending, stages])`. Пока висит `placeholderData`,
глобальная переменная показывает фолбэк, а первый ответ меняет её для всех потребителей вне рендера.

## Решение

`queryFn` возвращает данные, остальное получает их явным аргументом:

```ts
export function useStages() {
  return useQuery(stageQueries.list())            // один кэш на всё приложение, синглтон не нужен
}

function StagesPage() {
  const { data: stages = [] } = useStages()
  const statuses = getAllStatuses(stages, doneTasks, pending)   // чистая функция без глобалей
  // ...
}
```

Если данные нужны вне React (в роутере, в утилите), бери их из кэша: `queryClient.getQueryData(key)`
или `ensureQueryData`.

## Почему

Побочный эффект в `queryFn` повторяется при каждом рефетче и ретрае и не виден React. Фиктивная
зависимость в `useMemo` ломается, как только кто-то «почистит» deps или включит React Compiler, который
мемоизирует по реальным зависимостям ([react-architecture §10](../../skills/react-architecture/SKILL.md)).

## Источник

Найдено в SPA онбординга сотрудников (`src/api/queries.ts`, `src/data/stages.ts`), октябрь 2026.
