---
title: RHF + Zod 4 — типы input и output расходятся при coerce/transform, required_error больше нет
type: gotcha
stack: [react, vite, next]
tags: [react-hook-form, zod, resolvers, coerce, transform, types]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

В схеме формы есть `z.coerce.number()`, `.transform()` или `.default()`. Тип того, что лежит в полях
(input), и того, что приходит в `onSubmit` (output), разный. Если типизировать `useForm` через
`z.infer` (это output), `defaultValues` и `Controller` начинают ругаться или молча врут.
После миграции на Zod 4 пропадают сообщения ошибок, заданные через `required_error`.

## Решение

- `@hookform/resolvers` v5 (нужен `react-hook-form` ≥ 7.55) с `zodResolver(schema)` выводит оба типа сам.
  Явная форма:

```ts
type In = z.input<typeof orderFormSchema>
type Out = z.output<typeof orderFormSchema>

const form = useForm<In, unknown, Out>({
  resolver: zodResolver(orderFormSchema),
  defaultValues: { quantity: '' } satisfies Partial<In>,
})
const onSubmit = (values: Out) => createOrder.mutate(values)   // quantity уже number
```

- В Zod 4 параметры `required_error` и `invalid_type_error` убраны. Используй единый `error`
  (строка или функция), как в [forms.md](../../skills/react-ux/references/forms.md):
  `z.string({ error: 'orders.form.name.required' })`.
- Схема формы живёт в `features/<f>/lib/` и не равна схеме ответа API.

## Почему

Без разделения input/output либо ломается типизация `defaultValues`, либо в `onSubmit` прилетает строка
там, где ждали число. Старые параметры Zod 3 после миграции не дают ошибку на этапе работы формы,
а просто пропадает текст сообщения.

## Источник

https://github.com/react-hook-form/resolvers (README v5), https://zod.dev/v4/changelog, октябрь 2026.
