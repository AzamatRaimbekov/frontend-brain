# Архитектура: три плагина, один движок

Решение 2026-10-31. В репозитории три плагина Claude Code. Каждый ставится отдельно; движок ставит оба других сам через `dependencies`.

```
figma-pack      дизайн   Figma MCP, каталог Mbank, токены из Figma, билдер экранов (спека → Figma)
frontend-pack   код      правила React, UI-кит Mbank, шаблоны, спека → код, токены → CSS
design-engine   движок   связка дизайна и кода: конвейеры, карта компонентов, синхронизация токенов
                         dependencies: figma-pack, frontend-pack
```

| Установка | Что получает человек |
|---|---|
| `claude plugin install figma-pack@frontend-brain` | дизайнер: рисовать в Figma из дизайн-системы, спека экранов, токены |
| `claude plugin install frontend-pack@frontend-brain` | фронтендер: правила, кит, генерация страниц из спеки, ревью |
| `claude plugin install design-engine@frontend-brain` | всё вместе: ТЗ → Figma → код одной командой |

## Правила границ

1. **Плагин не ссылается на файлы другого плагина.** Никаких относительных путей наружу (`../figma-pack/...`, `../../../frontend-pack/...`): после установки плагины лежат в разных папках кэша с версиями, и такая ссылка ломается. Проверка: `scripts/check-boundaries.mjs` в `npm test`.
2. **Упоминать другой плагин можно только по имени скилла или агента** (`frontend-pack:mbank-ui`) и только как необязательный шаг: «если установлен». Плагин обязан работать без соседа.
3. **Всё, что знает и про Figma, и про код, живёт в design-engine**: design-to-code, figma-to-react / -react-native / -flutter, агенты design-lead и design-qa, карта компонентов Figma ↔ код, синхронизация токенов.
4. **Контракты** — файлы, которые один плагин производит, а другой потребляет. У каждого контракта один владелец; потребитель держит копию, которую обновляет только `design-engine` (`sync-contracts`), а тест проверяет, что копии совпадают.

| Контракт | Владелец (источник) | Копия у потребителя |
|---|---|---|
| Токены Mbank `tokens.json` | figma-pack `skills/mbank-figma-patterns/references/tokens.json` | frontend-pack `registry/mbank/tokens.json` (вход `tokens-build.mjs`) |
| Формат спеки экранов `spec@1` | figma-pack `builder/core/spec.js` + `skills/figma-spec/references/spec-format.md` | frontend-pack `references/spec-format.md` (вход `spec-to-code.mjs`) |
| Контракты компонентов `mbank/component@1` | figma-pack `builder/contracts/*.json` (формат `builder/docs/component-contract.md`) | frontend-pack `registry/mbank/contracts/` — вся папка (вход `contract-to-code.mjs`) |
| Карта компонентов Figma ↔ код | design-engine `references/components-map.json` | — (обе стороны читает только движок) |

## Как движок находит соседей

Своего пути у плагина нет иначе как `${CLAUDE_PLUGIN_ROOT}`. Пути соседей движок ищет скриптом `scripts/resolve-plugin.mjs`: сначала рядом в репозитории (`plugins/<имя>`), затем в кэше установленных плагинов (`~/.claude/plugins/cache/<marketplace>/<имя>/<версия>`, берётся старшая версия), затем переменные `FIGMA_PACK_DIR` / `FRONTEND_PACK_DIR`.

## Версии

Каждый плагин версионируется отдельно (`plugin.json` = запись в marketplace, проверяет `npm test`). `design-engine` держит диапазоны: `{ "name": "frontend-pack", "version": "^0.14" }`. Релиз: тег `<плагин>--v<версия>` (`claude plugin tag`).
