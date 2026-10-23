---
title: Контент — это данные, а не код — уроки и словари грузи по требованию, монолиты дели реестром
type: rule
stack: [react, vite, next]
tags: [bundle, code-splitting, dynamic-import, lazy, i18n, monolith]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

На сайте около 20 тыс. строк учебного контента (`src/data/lessons/*.ts`, файлы по 1–4,4 тыс. строк)
статически импортируются в один модуль, который тянут страницы урока. Открытие любого урока грузит контент
всех направлений, и ленивые маршруты теряют смысл. Рядом компоненты-монолиты: плеер шагов на 3162 строки,
редактор на 2653, плюс самописные словари перевода на сотни строк в главном чанке.

## Решение

- Контент — в API или в JSON/модулях, которые грузятся по требованию через тот же кэш Query:

```ts
const loaders = {
  frontend: () => import('./lessons/frontend'),
  english: () => import('./lessons/english'),
} as const

export const lessonQueries = {
  byDirection: (dir: keyof typeof loaders) => queryOptions({
    queryKey: ['lessons', dir],
    queryFn: async () => (await loaders[dir]()).LESSONS,
    staleTime: Infinity,
  }),
}
```

- Плеер с N типами шагов — реестр `stepType → lazy(() => import('./steps/X'))`, каждый шаг — отдельный
  файл до 150 строк ([decomposition-example.md](../../skills/react-architecture/references/decomposition-example.md)).
- Переводы — `react-i18next` с namespace на страницу и ленивой загрузкой, а не самописный словарь в бандле.
- Контроль: сравнивай размер главного чанка из `vite build` в MR; рост без причины — повод разобраться.

## Почему

Статический импорт данных сводит на нет разделение по маршрутам: мобильный пользователь качает курсы,
которые не проходит. Монолит на 3000 строк невозможно ревьюить и мержить без конфликтов.

## Источник

Найдено на сайте образовательной платформы (`src/data/lessons.ts`, `CourseStepPlayer.tsx`, `lib/i18n.ts`),
октябрь 2026.
