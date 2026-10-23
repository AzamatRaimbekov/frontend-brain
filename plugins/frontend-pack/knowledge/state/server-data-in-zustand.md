---
title: Серверные данные в zustand — logout оставляет чужие данные, PATCH профиля затирает поля
type: gotcha
stack: [react, vite, next]
tags: [zustand, server-state, logout, profile, tanstack-query]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Запрет из `rules/libraries.json` («server data в Zustand») на практике. В проекте профиль, прогресс,
SLA и уведомления скопированы из `/api/me` в zustand-стор. Два реальных бага:

1. `logout` сбрасывает только часть полей: уведомления, счётчик и SLA остаются, кэш `['me']` в
   QueryClient не чистится. Следующий пользователь на общем устройстве (планшет, WebView) видит чужое.
2. `updateProfile` после PATCH делает `set({ user: { id, email, name, avatar } })` — пропадают
   `isStaff`, `department` и другие поля, и после смены имени у сотрудника исчезает админ-меню.
   TypeScript молчит, потому что поля в типе опциональные.

## Решение

- Профиль читаем через `useQuery(meQueries.current())`, производные считаем при рендере.
- Мутация профиля обновляет кэш со spread или инвалидирует его:

```ts
onSuccess: (patch) =>
  queryClient.setQueryData(meQueries.current().queryKey, (old) =>
    old && { ...old, user: { ...old.user, ...patch } }),
```

- Logout: `queryClient.clear()` (см. [clear-query-cache-on-logout](../security/clear-query-cache-on-logout.md)).
- Если стор остаётся (только UI-состояние), сбрасывай его целиком, а не по полям:

```ts
const initial: UiState = { sidebarOpen: false, tourStep: 0 }
export const useUiStore = create<UiState & { reset: () => void }>()((set) => ({
  ...initial,
  reset: () => set(initial),
}))
```

## Почему

Две копии одних данных синхронизируются руками: каждое новое поле надо не забыть в hydrate, reset и merge.
Частичный `set` без spread молча теряет данные. Кэш Query — один источник правды
([react-data-fetching](../../skills/react-data-fetching/SKILL.md)).

## Источник

Найдено в SPA онбординга сотрудников (`src/store/useOnboarding.ts`, hydrate/logout/updateProfile), октябрь 2026.
