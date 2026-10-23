---
title: Длинная анкета — серверный черновик и useForm на шаг вместо одного useForm в sessionStorage
type: decision
stack: [all]
tags: [multi-step, wizard, draft, react-hook-form, tanstack-query, token]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Правило по умолчанию из [forms.md](../../skills/react-ux/references/forms.md): многошаговая форма —
один `useForm`, шаг в URL, черновик в `sessionStorage`. Для длинной анкеты этого мало, если:

- её заполняют в несколько заходов или с разных устройств;
- на середине есть серверная проверка (код на почту или телефон);
- в ней загружаются файлы на сервер.

`sessionStorage` теряется при смене устройства и закрытии вкладки, а верификацию на клиенте не сохранить.

## Решение

Если выполняется хотя бы одно условие выше — серверный черновик:

- Черновик (`token` + `draft`) читается одним `queryOptions` из `features/<f>/api` с `staleTime: Infinity`,
  `refetchOnMount: 'always'` и `refetchOnWindowFocus: false`, чтобы фоновый рефетч не перезатёр ввод.
- На каждый шаг свой `useForm` со своей Zod-схемой. «Далее» = мутация `PUT /drafts/:token/steps/:n`,
  в `onSuccess` — `queryClient.setQueryData(draftKey, fresh)`.
- Ссылка «продолжить позже» `?draft=<token>`: токен читается один раз и сразу убирается из адреса
  (`setSearchParams(next, { replace: true })`), чтобы не попасть в историю и на скриншоты.
- Если сервер ротирует токен (например, после подтверждения почты), обнови его **и** в хранилище,
  **и** в кэше запроса — иначе следующий запрос уйдёт со старым токеном.
- После отправки токен забывай и черновик заново не запрашивай.
- Доступ к `localStorage` — только в `try/catch` (приватный режим, WebView).

Короткие формы на 2–3 шага по-прежнему делай по правилу скилла.

## Почему

Один `useForm` в `sessionStorage` проще, но не переживает смену устройства и серверную верификацию.
Черновик в кэше Query — единственный источник правды; отдельный `useForm` на шаг держит схемы маленькими
и даёт валидацию шага без `trigger(stepFields)`.

## Источник

Проверено на SPA онбординга сотрудников (анкета кандидата, Vite + React 19 + TanStack Query 5),
`src/features/application-form/api/draft.queries.ts`, `hooks/useDraftSession.ts`, октябрь 2026.
