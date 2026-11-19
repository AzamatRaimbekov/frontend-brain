# Архитектура: три плагина, один движок

Решение 2026-10-31. В репозитории три плагина Claude Code. Как ими пользоваться от ТЗ до кода — [design-automation.md](design-automation.md). Каждый ставится отдельно; движок ставит оба других сам через `dependencies`.

```
figma-pack      дизайн   Figma MCP, каталог Mbank, токены shadcn/ui, билдер экранов (спека → Figma)
frontend-pack   код      правила React, UI-кит Mbank, шаблоны, спека → код, токены → CSS
design-engine   движок   связка дизайна и кода: конвейеры, карта компонентов, синхронизация токенов
                         dependencies: figma-pack, frontend-pack
```

| Установка | Что получает человек |
|---|---|
| `claude plugin install figma-pack@frontend-brain` | дизайнер: рисовать в Figma из дизайн-системы, спека экранов, токены |
| `claude plugin install frontend-pack@frontend-brain` | фронтендер: правила, кит, генерация страниц из спеки, ревью |
| `claude plugin install design-engine@frontend-brain` | всё вместе: ТЗ → Figma → код одной командой |

Приложение на стороне Figma — внутри figma-pack: **виджет shadcn Tokens** (`plugins/figma-pack/widget`, токены shadcn/ui на холсте: значения проекта, запись в переменные, выгрузка для кода) и **плагин DS Builder** (`plugins/figma-pack/builder`, экраны и компоненты из спеки и контрактов). Оба импортируются в Figma из `manifest.json` без сборки.

## Правила границ

1. **Плагин не ссылается на файлы другого плагина.** Никаких относительных путей наружу (`../figma-pack/...`, `../../../frontend-pack/...`): после установки плагины лежат в разных папках кэша с версиями, и такая ссылка ломается. Проверка: `scripts/check-boundaries.mjs` в `npm test`.
2. **Упоминать другой плагин можно только по имени скилла или агента** (`frontend-pack:mbank-ui`) и только как необязательный шаг: «если установлен». Плагин обязан работать без соседа.
3. **Всё, что знает и про Figma, и про код, живёт в design-engine**: design-to-code, figma-to-react / -react-native / -flutter, агенты design-lead и design-qa, карта компонентов Figma ↔ код, синхронизация токенов.
4. **Токены — только стандартные shadcn/ui** (решение 2026-11-11). Своего слоя токенов Mbank нет: ни алиасов на переменные Foundation, ни карты имён CSS ↔ Figma, ни продуктовых брендов, ни своих цветов поверхностей и статусов, ни отступов и типографики Mbank. Проект меняет значения стандартных имён (пресет на сайте `apps/ds-configurator`), новых имён не добавляет.
5. **Контракты** — файлы, которые один плагин производит, а другой потребляет. У каждого контракта один владелец; потребитель держит копию, которую обновляет только `design-engine` (`sync-contracts`), а тест проверяет, что копии совпадают.

| Контракт | Владелец (источник) | Копия у потребителя |
|---|---|---|
| Токены shadcn/ui `shadcn-tokens.json` (`shadcn/tokens@1`: 31 цвет light/dark в oklch, `radius`, шкала радиусов, шрифты) | figma-pack `skills/ds-tokens/references/shadcn-tokens.json` | frontend-pack `registry/mbank/shadcn-tokens.json` (вход `tokens-build.mjs` → `tokens.css`) |
| Формат спеки экранов `spec@1` | figma-pack `builder/core/spec.js` + `skills/figma-spec/references/spec-format.md` | frontend-pack `references/spec-format.md` (вход `spec-to-code.mjs`) |
| Список платформ и ширин экранов | figma-pack `builder/core/platforms.js` (правится руками, токенов в нём нет) | frontend-pack `scripts/spec-to-code/platforms.mjs` |
| Контракты компонентов `mbank/component@1` | figma-pack `builder/contracts/*.json` (формат `builder/docs/component-contract.md`) | frontend-pack `registry/mbank/contracts/` — вся папка (вход `contract-to-code.mjs`) |
| Карта компонентов Figma ↔ код | design-engine `references/components-map.json` | — (обе стороны читает только движок) |

## Как движок находит соседей

Своего пути у плагина нет иначе как `${CLAUDE_PLUGIN_ROOT}`. Пути соседей движок ищет скриптом `scripts/resolve-plugin.mjs`: сначала рядом в репозитории (`plugins/<имя>`), затем в кэше установленных плагинов (`~/.claude/plugins/cache/<marketplace>/<имя>/<версия>`, берётся старшая версия), затем переменные `FIGMA_PACK_DIR` / `FRONTEND_PACK_DIR`.

## Версии

Каждый плагин версионируется отдельно (`plugin.json` = запись в marketplace, проверяет `npm test`). `design-engine` держит диапазоны: `{ "name": "frontend-pack", "version": "^0.14" }`. Релиз: тег `<плагин>--v<версия>` (`claude plugin tag`).

## MCP движка

`design-engine` поднимает MCP-сервер `mbank-ds` (`plugins/design-engine/.mcp.json` → `mcp/server.mjs`): токены (`ds_tokens` — стандартный набор shadcn/ui из `shadcn-tokens.json`: значения light/dark, переменная Figma с тем же именем), компоненты кита с контрактами и командами установки, проверка и синхронизация проекта с текущими токенами. Так любой агент (Claude Code, Cursor, Codex) строит фронт по тем же токенам, что и Figma.
