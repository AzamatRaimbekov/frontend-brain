---
title: Сетап Vitest для UI — src/test/setup.ts, стабы jsdom (scrollTo, matchMedia), мок анимаций, сеть через MSW или fetch по DI
type: recipe
stack: [react, vite, next]
tags: [vitest, jsdom, setup, msw, fetch, motion, flaky, scrollTo, tanstack-router, jest-dom]
author: AzamatRaimbekov
updated: 2026-10-25
---

## Контекст

Без сетапа jsdom падает на половине UI-библиотек (`matchMedia`, `ResizeObserver`), анимации делают тесты
медленными и нестабильными, токены в storage перетекают между тестами. Под нагрузкой (весь монорепо
параллельно) первый рендер с роутером не укладывается в секунду по умолчанию. TanStack Router при навигации
восстанавливает скролл и зовёт `window.scrollTo`, которого в jsdom нет: в выводе тестов сыпется
"Not implemented: window.scrollTo".

## Решение

`src/test/setup.ts`, подключённый в `vite.config.ts` → `test.setupFiles: ['./src/test/setup.ts']` (не флагом
CLI, чтобы IDE и CI запускали одинаково). Именно внутри `src/`: корневой `vitest.setup.ts` не попадает в
`include` у `tsconfig.app.json`, и типы матчеров jest-dom (`toBeInTheDocument`) пропадают в тестах. Рядом —
`src/test/server.ts` (MSW) и `src/test/render.tsx` (`renderWithClient`, `renderRoute`).

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 5000 })              // в vitest: testTimeout: 15_000
window.scrollTo = () => {}                          // TanStack Router: восстановление скролла
window.matchMedia ??= (q) => ({ matches: false, media: q, onchange: null, addEventListener() {},
  removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false })
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); sessionStorage.clear() })
```

- Анимации `motion`: `MotionGlobalConfig.skipAnimations = true` в сетапе (`import { MotionGlobalConfig } from 'motion/react'`)
  вместо мока модуля через `Proxy` — компоненты рендерятся настоящими, только без анимаций.
- MSW: `beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))` — в MSW 3 опция называется так,
  старая молча игнорируется ([msw-v3-on-unhandled-frame](msw-v3-on-unhandled-frame.md)).
- Сеть в тестах страниц — MSW, как в [testing.md](../../skills/react-data-fetching/references/testing.md):
  проверяются URL, заголовки и разбор ответа. `vi.mock('../lib/api')` прячет именно это — оставь `vi.mock`
  для границ вроде навигации и таймеров.
- Для модулей без React (store сессии, http-клиент) удобнее DI: клиент принимает `fetch` параметром, а
  `fakeFetch({ 'POST /auth/refresh': () => Response.json(pair()) })` ведёт журнал вызовов — можно проверить,
  что на пять 401 ушёл ровно один refresh. Хелперы — в `src/shared/test/`, не в фиче.
- `test.exclude: [...configDefaults.exclude, 'e2e/**']`, чтобы Vitest не подхватывал спеки Playwright.

## Почему

Стабы и очистка убирают флаки, которые не связаны с кодом. Тест должен падать по сути, а не по времени.

## Источник

Проверено в админке образовательной платформы (`src/test/setup.tsx`) и SPA в pnpm-монорепо
(`test-setup.ts`, `features/auth/testing.ts`), октябрь 2026. `MotionGlobalConfig.skipAnimations` — экспорт `framer-motion`/`motion-utils` 14.6.
Стаб `scrollTo` и место сетапа в `src/test/` — прогон агента frontend-engineer на демо-проекте заказов
(TanStack Router, code-based routes), октябрь 2026.
