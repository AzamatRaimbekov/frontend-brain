---
title: Code Connect — template files вместо legacy-парсера React, CLI из CI по умолчанию
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
- Кто пишет связи: для связей, которые живут в коде, по умолчанию CLI из CI; MCP
  `send_code_connect_mappings` (агент figma-designer, см. figma-pack `figma-core/references/design-system-sync.md`)
  допустим для связей через UI. Для одного компонента два способа не смешивай.
- Публикация CLI: `npx figma connect publish` из CI, токен — переменная `FIGMA_ACCESS_TOKEN` в настройках CI,
  не в репозитории. На MR — `--dry-run --exit-on-unreadable-files`.
- Связи, созданные через CLI, в интерфейсе Figma только просматриваются — правь их в коде.
- Тарифы и места: каноничное место — figma-pack `figma-core/references/design-system-sync.md`. Документация
  Figma на 2026-10-24: «Dev or Full seat on the Professional, Organization, and Enterprise plans»; на
  Professional — одна активная библиотека и один фреймворк. figma-pack пока пишет «Organization/Enterprise» —
  расхождение передано владельцу figma-pack; до правки ориентируйся на документацию Figma.
- Props в шаблонах маппятся через таблицу «значение Figma → значение cva» из figma-pack
  `mbank-design-system/references/code-mapping.md` (`flat` → `ghost`, `Size=m` → `size="md"`); имена cva —
  семантические по react-ui ([design-system-code-kit](../ui/design-system-code-kit.md)).

## Почему

Без Code Connect MCP каждый раз генерирует компонент с нуля. Legacy-парсер привязывает связи к React и
ломается при обновлениях; template files переживают смену фреймворка.

## Источник

https://developers.figma.com/docs/code-connect/, https://developers.figma.com/docs/code-connect/cli-reference/, октябрь 2026.
