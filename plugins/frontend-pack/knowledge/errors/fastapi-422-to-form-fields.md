---
title: 422 от FastAPI/pydantic переводи в fieldErrors в http.ts, а не в каждой форме
type: recipe
stack: [all]
tags: [fastapi, pydantic, 422, validation, react-hook-form, setError, ApiError]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Бэкенд на FastAPI отдаёт ошибку валидации не в формате RFC 9457, а так:
`{ "detail": [{ "loc": ["body", "email"], "msg": "Value error, ...", "type": "..." }] }`.
Иногда `detail` — просто строка. Наш `errorBodySchema` из
[api-errors.md](../../skills/react-error-handling/references/api-errors.md) ждёт `errors: Record<string, string[]>`,
поэтому `applyServerErrors` ничего не находит: поле не подсвечивается, пользователь видит общий текст.

## Решение

Адаптируй контракт **один раз** в `src/shared/api/errorBody.ts`: разбери массив `detail` в `errors`, и
`ApiError.kind === 'validation'` + `applyServerErrors` заработают без изменений.

```ts
const pydanticItem = z.looseObject({ loc: z.array(z.union([z.string(), z.number()])), msg: z.string() })

export function normalizeErrorBody(raw: unknown): ErrorBody {
  const fastapi = z.looseObject({ detail: z.array(pydanticItem) }).safeParse(raw)
  if (!fastapi.success) {
    const parsed = errorBodySchema.safeParse(raw)
    return parsed.success ? parsed.data : {}
  }
  const errors: Record<string, string[]> = {}
  for (const item of fastapi.data.detail) {
    const field = String(item.loc.at(-1) ?? '')          // первый элемент всегда 'body'/'query'
    const msg = item.msg.replace(/^Value error, /, '')     // префикс кастомных валидаторов pydantic
    ;(errors[field] ??= []).push(msg)
  }
  return { errors }
}
```

В `http.ts` вместо `errorBodySchema.safeParse(raw)` вызывай `normalizeErrorBody(raw)`.

- `knownFields` передаёт форма (`formSchema.keyof().options`): ошибка поля с другого шага не теряется
  в невидимом поле, а уходит в `root.server`.
- 409 и другие доменные отказы («заявка уже существует») маппь по `code` в `onError` мутации, а не
  через поля.
- Текст `msg` от pydantic показывай, только если бэкенд гарантирует, что он на русском и безопасен.
  Иначе маппь по `type` на i18n-ключ: правило скилла «серверный detail пользователю не показываем»
  остаётся в силе.

## Почему

Разбор формата бэкенда в каждой форме даёт N копий одной логики. Нормализация на границе
(`shared/api`) — единственное место, которое знает о FastAPI; формы работают с одним `ApiError`.
Функция чистая и тестируется юнит-тестом без рендера.

## Источник

Проверено на SPA онбординга сотрудников (Vite + React 19 + FastAPI), `src/features/application-form/lib/serverErrors.ts`,
октябрь 2026. Формат ошибок FastAPI: https://fastapi.tiangolo.com/tutorial/handling-errors/
