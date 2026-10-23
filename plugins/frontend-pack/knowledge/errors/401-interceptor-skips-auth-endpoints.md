---
title: 401-перехватчик не трогает /auth/login — иначе «неверный пароль» превращается в «сессия истекла»
type: gotcha
stack: [react, vite, next]
tags: [auth, 401, refresh, login, http-client]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Общий http-клиент ловит любой 401: делает refresh или редиректит на `/login`. Бэкенд на неверный пароль
тоже отвечает 401. Найдено в двух проектах:

- клиент на 401 делает `window.location.href = '/login'` — страница входа перезагружается, ошибка
  пропадает, пользователь не понимает, что случилось;
- клиент на 401 идёт в `/auth/refresh`, тот падает, приходит событие «session expired» — пользователь
  видит «Сессия истекла» вместо «Неверный логин или пароль».

## Решение

В `src/shared/api/http.ts` держи явный список путей, которые не проходят через перехват 401 и refresh:

```ts
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/oauth', '/auth/reset-password']
const skipAuthRetry = AUTH_PATHS.some((p) => path.startsWith(p))

if (res.status === 401 && !skipAuthRetry) {
  // refresh -> один повтор, иначе onSessionExpired()
}
if (!res.ok) throw await toApiError(res)   // login получит обычный ApiError со status 401
```

- Форма входа показывает ошибку через `setError('root.server', ...)` по `status`/`code`.
- Переход на `/login` после истечения сессии — через роутер (`navigate`/`redirect`) или подписку на
  событие, не через `location.href`: полная перезагрузка стирает состояние и тосты.
- Тест: «неверный пароль → виден текст ошибки, URL не изменился».

## Почему

Перехватчик пишут под защищённые запросы и забывают, что вход тоже отвечает 401. Юнит-тест клиента это
не ловит, потому что проверяет перехватчик отдельно от формы. Правило «401 обрабатывается в http.ts»
из [api-errors.md](../../skills/react-error-handling/references/api-errors.md) остаётся, просто с исключениями.

## Источник

Найдено в админке и сайте образовательной платформы (Vite + React 19, свой `apiFetch`), октябрь 2026.
Рецепт refresh: [single-flight-token-refresh](../security/single-flight-token-refresh.md).
