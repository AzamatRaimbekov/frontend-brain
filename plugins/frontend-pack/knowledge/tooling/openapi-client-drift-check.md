---
title: CI падает, если клиент API не совпадает с актуальным OpenAPI-описанием
type: recipe
stack: [all]
tags: [openapi, openapi-typescript, openapi-fetch, codegen, ci, contract]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Типы из `openapi-typescript` полезны, пока совпадают с бэкендом. Бэкенд меняют, `schema.d.ts` забывают
перегенерировать — фронт компилируется со старыми типами и ломается на стенде.

## Решение

- Типы и клиент — в одном месте: в монорепо пакет `packages/api-client` (`openapi.json`, `schema.d.ts`,
  тонкий `createApiClient` на `openapi-fetch`), в одиночном проекте — `src/shared/api/generated/`.
- Скрипт `generate` выгружает описание и перегенерирует типы.
- CI повторяет генерацию и падает на диффе:

```yaml
lint:
  script:
    - pnpm -r lint
    - pnpm generate
    - git diff --exit-code -- packages/api-client || { echo "api-client устарел — pnpm generate и закоммитьте"; exit 1; }
```

- Бэкенд в другом репозитории — описание качается с dev-стенда или из артефакта бэкенд-пайплайна.
- Клиент принимает `fetch` параметром (`fetch ?? ((r) => globalThis.fetch(r))`): тесты подставляют
  фейковый сервер, middleware авторизации подключается через `api.use(...)`.
- Ответы всё равно проходят Zod на границе, если бэкенд не гарантирует описание
  ([http-client.md](../../skills/react-data-fetching/references/http-client.md)).

## Почему

Расхождение контракта ловится в MR, а не у пользователя. Сгенерированные типы ничего не стоят в рантайме.

## Источник

Проверено на SPA в pnpm-монорепо (`.gitlab-ci.yml`, `packages/api-client`), октябрь 2026.
https://openapi-ts.dev/introduction
