---
title: create-vite по умолчанию ставит Oxlint — передавай --eslint
type: gotcha
stack: [vite]
tags: [create-vite, eslint, oxlint, scaffold]
author: AzamatRaimbekov
updated: 2026-10-22
---

## Контекст

Новый проект на Vite по скиллу `react-new-project`. Свежий `create-vite` (Vite 8) для React-шаблонов предлагает Oxlint вместо ESLint, а в TTY уходит в интерактивные вопросы, и агент повисает.

## Решение

Создавай проект без вопросов и с ESLint:

```bash
npx -y create-vite@latest <dir> --template react-ts --eslint --no-interactive --no-immediate
```

- `--eslint` — нужен ESLint: наш `eslint.config.js` (max-lines 150, hooks, query, границы импортов) написан под него.
- `--no-interactive` — без вопросов в терминале.
- `--no-immediate` — не ставить зависимости и не запускать dev-сервер сразу: сначала доставим пакеты из белого списка.

Перед запуском всё равно проверь флаги: `npx -y create-vite@latest --help`.

## Почему

Без `--eslint` проект получит Oxlint, и правила команды из `react-architecture/references/eslint-config.md` не подключатся. Без `--no-interactive` агент ждёт ответа, которого никто не даст.

## Источник

Проверено `create-vite@latest --help` и созданием проекта, октябрь 2026 (Vite 8.3, TypeScript 6.0, React 19.3).
