---
title: Бизнес-правила формы — чистые функции в features/<f>/lib с инъекцией «сегодня», тесты без рендера
type: recipe
stack: [all]
tags: [vitest, zod, forms, pure-functions, dates, superRefine]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

В удачной фиче анкеты всё, что не UI, вынесено в `features/<f>/lib/`: валидаторы (ИНН, телефон, возраст,
ISO-дата), Zod-схемы шагов, карта «шаг → поля», маппинг статуса в отображение. Тесты на них быстрые и
стабильные. В соседних фичах та же логика смешана с JSX и проверяется только руками.

## Решение

- Правила — чистые функции; «сегодня» передаётся аргументом, тест детерминирован:

```ts
export function ageOn(isoBirthDate: string, today = new Date()): number { /* ... */ }

it('считает полные годы', () => {
  const today = new Date(2026, 9, 15)
  expect(ageOn('2008-10-15', today)).toBe(18)
  expect(ageOn('2008-10-16', today)).toBe(17)
  expect(ageOn('2008-02-29', new Date(2026, 1, 28))).toBe(17)
})
```

- Условно-обязательные поля — в `superRefine`, сообщения — i18n-ключи в одном словаре:

```ts
export const stepSchema = z.object({ nameChanged: z.boolean(), prevName: z.string() })
  .superRefine((v, ctx) => {
    if (v.nameChanged && !v.prevName.trim())
      ctx.addIssue({ code: 'custom', path: ['prevName'], message: 'form.prevName.required' })
  })
```

- Схемы тестируются через `safeParse` на граничных значениях, а не через рендер формы.
- Следующий уровень — тест страницы через Testing Library + MSW на loading/empty/500/422
  ([testing.md](../../skills/react-data-fetching/references/testing.md)).

## Почему

Логика внутри JSX проверяется только E2E. Чистые функции с инъекцией времени тестируются за миллисекунды и
ловят регрессии в датах: 29 февраля, «ровно 18 лет», смена часового пояса.

## Источник

Проверено на SPA онбординга сотрудников (`features/application-form/lib/rules.ts`, `schemas.ts`,
`tests/unit/application-form/*`), октябрь 2026.
