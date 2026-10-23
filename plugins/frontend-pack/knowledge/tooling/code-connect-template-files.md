---
title: Code Connect — template files вместо legacy-парсера React, публикация только через CLI в CI
type: gotcha
stack: [react, vite, next]
tags: [figma, code-connect, design-system, ci, cli]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Code Connect даёт Figma MCP прямые ссылки на наши компоненты: вместо сгенерированной разметки агент
получает `<Button variant="primary">` из `shared/ui`. Старые гайды учат писать `*.figma.tsx` с
framework-парсером React, а это теперь legacy.

## Решение

- Пиши **template files** (TypeScript, не зависят от фреймворка) — рекомендуемый способ по документации
  Figma. Интеграции React/HTML/SwiftUI/Compose помечены как legacy.
- Файлы Code Connect не исполняются: тернарники попадают в сниппет дословно, `figma.connect` нельзя
  генерировать в цикле. Одна связь — один явный вызов.
- Публикация: `npx figma connect publish` из CI, токен — переменная `FIGMA_ACCESS_TOKEN` в настройках CI,
  не в репозитории. На MR — `--dry-run --exit-on-unreadable-files`.
- Связи, созданные через CLI, в интерфейсе Figma только просматриваются — правь их в коде.
- Ограничения: Dev или Full seat на Professional, Organization или Enterprise. На Professional — одна
  активная библиотека и один фреймворк; первая публикация фиксирует фреймворк, связи старого перестают
  отдаваться MCP.
- Имена вариантов `cva` совпадают со значениями свойств компонента в Figma — тогда маппинг props
  тривиален ([design-system-code-kit](../ui/design-system-code-kit.md)).

## Почему

Без Code Connect MCP каждый раз генерирует компонент с нуля. Legacy-парсер привязывает связи к React и
ломается при обновлениях; template files переживают смену фреймворка.

## Источник

https://developers.figma.com/docs/code-connect/, https://developers.figma.com/docs/code-connect/cli-reference/, октябрь 2026.
