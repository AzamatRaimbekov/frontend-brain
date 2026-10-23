---
title: Лишние и запрещённые пакеты в package.json — агент начинает ими пользоваться, ловим в CI
type: gotcha
stack: [react, vite, next]
tags: [dependencies, package-json, libraries-json, ci, no-restricted-imports, motion]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

В одном `package.json` нашлось сразу:

- `framer-motion` и `motion` вместе, `motion` нигде не импортируется;
- `gsap` + `@gsap/react` (запрещены) в работе;
- `@hugeicons/*` и `@radix-ui/react-toast` установлены и не используются;
- `postcss` и `autoprefixer` при `@tailwindcss/vite` без конфига postcss;
- `tailwindcss-animate` (плагин для Tailwind v3) вместо `tw-animate-css`;
- около 20 отдельных `@radix-ui/react-*` вместо единого `radix-ui`.

Агент видит в зависимостях hugeicons и gsap и начинает генерировать код с ними.

## Решение

- Запрещённые пакеты из `rules/libraries.json` (`forbidden`) блокируй правилом ESLint, тогда CI падает
  на импорте:

```js
'no-restricted-imports': ['error', { paths: [
  { name: 'framer-motion', message: 'Используй motion/react' },
  { name: 'gsap', message: 'Запрещено: motion или CSS' },
  { name: 'react-icons', message: 'Только lucide-react' },
]}],
```

- Неиспользуемые зависимости ищи на ревью раз в спринт: `pnpm why <pkg>` и поиск импорта по `src`.
  Инструмент для CI (например, knip) не в белом списке — сначала PR в `rules/libraries.json`.
- Миграции: `framer-motion` → `motion/react` (меняется только импорт); `tailwindcss-animate` →
  `@import "tw-animate-css"`; отдельные `@radix-ui/react-*` → единый `radix-ui` (импорты меняются только
  в `shared/ui`, перед этим проверь `npx shadcn@latest --help` на наличие команды миграции).
- Новый пакет — только из `allowed` или после правки списка, иначе спроси лида.

## Почему

Лишние пакеты раздувают бандл и lockfile и путают генерацию кода. Белый список работает, только если
его нарушение ломает CI, а не замечается на ревью.

## Источник

Найдено в SPA онбординга сотрудников (`package.json`, `.oxlintrc.json` с двумя правилами), октябрь 2026.
