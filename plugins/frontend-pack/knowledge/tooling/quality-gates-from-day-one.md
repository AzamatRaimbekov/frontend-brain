---
title: strict в tsconfig, тесты под typecheck и скрипты typecheck/lint/test с первого коммита
type: rule
stack: [react, vite, next]
tags: [tsconfig, strict, eslint, typecheck, scripts, react-hooks, refs]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Что встретилось:

- в `tsconfig.app.json` нет `"strict": true`, тесты исключены из `include` и не проверяются ни одним tsconfig;
- `strict` есть, но `noUnused*: false`, ESLint не установлен вовсе;
- «прототип» без lint и тестов, в нём `ref.current = value` прямо в теле хука и
  `// eslint-disable-line react-hooks/exhaustive-deps` при отсутствующем ESLint. Прототип уехал в прод.

## Решение

Минимум для любого проекта, включая прототипы:

```jsonc
// tsconfig.app.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"]
}
```

- Тесты проверяются отдельным `tsconfig.test.json` (`types: ["vitest/globals", "@testing-library/jest-dom"]`),
  подключённым в `references` корневого tsconfig, чтобы `tsc -b` видел и их.
- Скрипты: `"typecheck"`, `"lint"` (конфиг из [eslint-config.md](../../skills/react-architecture/references/eslint-config.md),
  `eslint-plugin-react-hooks` v6+ ловит запись в ref во время рендера), `"test"` и
  `"check": "pnpm typecheck && pnpm lint && pnpm test"` — его гоняет CI ([gitlab-ci-frontend](gitlab-ci-frontend.md)).
- Включаешь strict в старом проекте — ставь `// @ts-expect-error TODO(strict)` по месту, а не выключай флаг.
- «Последнее значение для колбэка» — `useEffectEvent` (React 19.2+), а не `ref.current = x` в рендере
  ([state-and-effects.md](../../skills/react-architecture/references/state-and-effects.md)).
- Конфиги в монорепо — общий пакет (`packages/config`), а не копии.

## Почему

Без `strictNullChecks` `data.items.map` на `undefined` компилируется и падает в рантайме — ровно тот класс
ошибок, ради которого нужен TypeScript. Запись в ref во время рендера нарушает правила React, и React
Compiler молча перестаёт оптимизировать компонент.

## Источник

Найдено в админке и сайте образовательной платформы (`tsconfig.app.json`) и внутреннем портале
(`modules/chat/useChat.ts`); эталон — общий пакет конфигов в SPA в pnpm-монорепо, октябрь 2026.
