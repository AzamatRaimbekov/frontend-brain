# Автоматизация дизайна: спека → Figma → токены → код

Общая карта для тех, кто впервые открывает репозиторий. Детали каждой части — в её README, ссылки ниже. Границы плагинов и контракты — [architecture.md](architecture.md).

Цель: дизайнер и разработчик работают от одного источника. Экраны описывает одна JSON-спека, цвета, радиусы и шрифты — стандартные токены shadcn/ui (своих токенов Mbank нет, решение 2026-11-11). Из этого собираются и макет в Figma, и React-код. Расходятся они только там, где их правят руками.

## Части системы

| Часть | Где | Что делает | Подробно |
|---|---|---|---|
| Спека экранов `spec@1` | `plugins/figma-pack/builder/core/spec.js` | Один JSON: меню, экраны, блоки, состояния, переходы, платформа | [builder/README.md](../plugins/figma-pack/builder/README.md#агенту-написать-spec) |
| Плагин DS Builder | `plugins/figma-pack/builder/plugin` | В Figma собирает экраны из спеки и компоненты из контрактов | [builder/README.md](../plugins/figma-pack/builder/README.md) |
| Мост для Claude | `plugins/figma-pack/bridge/server.mjs` | Агент управляет Figma Desktop через DS Builder: сборка, экспорт PNG, проверочный код | [bridge/README.md](../plugins/figma-pack/bridge/README.md) |
| Виджет shadcn Tokens | `plugins/figma-pack/widget` | Доска токенов shadcn на холсте: значения проекта, запись в переменные Figma, выгрузка для кода | [widget/README.md](../plugins/figma-pack/widget/README.md) |
| Токены shadcn/ui | `plugins/figma-pack/skills/ds-tokens/references/shadcn-tokens.json` | 31 стандартный цвет shadcn (light/dark, oklch), `radius` и шкала радиусов, шрифты. Проект меняет только значения | [ds-tokens](../plugins/figma-pack/skills/ds-tokens/SKILL.md) |
| Сайт дизайн-системы | `apps/ds-configurator` | Проекты: пресет значений тех же токенов, выгрузка `tokens.css` и для виджета | `apps/ds-configurator` |
| Контракты компонентов `mbank/component@1` | `plugins/figma-pack/builder/contracts` | Части, свойства, состояния и токен на каждом свойстве компонента | [component-contract.md](../plugins/figma-pack/builder/docs/component-contract.md) |
| Генераторы кода | `plugins/frontend-pack/scripts` | `new-crm.mjs`, `spec-to-code.mjs`, `tokens-build.mjs` (→ `tokens.css`), `contract-to-code.mjs` | скилл `frontend-pack:mbank-crm` |
| Движок | `plugins/design-engine` | `sync-contracts.mjs` разносит копии, `build-front.mjs` собирает фронт одной командой, MCP `mbank-ds` | [architecture.md](architecture.md) |

## Как идут данные

```
ТЗ ──figma-spec──▶ spec.json ──┬─ DS Builder / мост ──▶ экраны в Figma
                               └─ spec-to-code ───────▶ React-проект (страницы, MSW-моки, UX.md, тесты)

shadcn-tokens.json (figma-pack ds-tokens) ─ sync-contracts ─▶ frontend-pack: registry/mbank/shadcn-tokens.json
        │                                                         │ tokens-build.mjs
        │ значения проекта: сайт ds-configurator, виджет          ▼
        ▼                                                    tokens.css (:root / .dark, @theme inline)
переменные Figma с теми же именями (background, primary, …)
```

У каждого контракта один владелец (figma-pack или design-engine). У потребителя лежит копия. Обновляет её только `sync-contracts`, а `npm test` падает, если копия разошлась с владельцем.

## Частые задачи

Все команды запускаются из корня репозитория.

**Собрать фронт из ТЗ или спеки** (скилл `design-engine:build-front`):

```bash
node plugins/figma-pack/builder/cli/ds.mjs spec check my.spec.json
node plugins/design-engine/scripts/build-front.mjs my.spec.json --project ../my-crm --name "Мой CRM"
```

**Нарисовать ту же спеку в Figma.** Есть два способа:
- Figma Desktop → DS Builder → «Экраны» → вставить спеку → «Собрать экраны».
- Агентом через мост: в Figma запусти DS Builder → «Мост для Claude», затем `POST 127.0.0.1:3055/run` с `{"type":"build","args":{"spec":…}}` или инструмент `figma_command` MCP `figma-bridge`.

**Поменять значения токенов и донести до кода.** Имена токенов не меняются и не добавляются, меняются только значения.
1. Поменять значения в `plugins/figma-pack/skills/ds-tokens/references/shadcn-tokens.json` (или пресет проекта на сайте ds-configurator).
2. Выполнить:
   ```bash
   node plugins/design-engine/scripts/sync-contracts.mjs
   npm test
   ```
   `sync-contracts` копирует файл во frontend-pack и пересобирает `tokens.css` (`tokens-build.mjs`).

**Добавить платформу или ширину экрана** (tablet, desktop, tv…): правится руками `plugins/figma-pack/builder/core/platforms.js` (`PLATFORMS` и `VIEWPORTS`), затем `node plugins/design-engine/scripts/sync-contracts.mjs`. Экран уже 600 px получает мобильную оболочку.

**Новый или изменённый компонент.**
1. DS Builder → «Компоненты» → «Скачать».
2. Положить `<name>.json` в `plugins/figma-pack/builder/contracts/`.
3. Выполнить:
   ```bash
   node plugins/design-engine/scripts/sync-contracts.mjs
   node plugins/frontend-pack/scripts/contract-to-code.mjs
   ```

**Пересобрать `dist`** после правки исходников плагина или виджета (нужен esbuild):
- плагин: `npm install && npm run build` в `plugins/figma-pack/builder`;
- виджет: то же в `plugins/figma-pack/widget`.

`dist` лежит в репозитории, поэтому дизайнеру собирать ничего не нужно.

## Токены

Один файл `shadcn-tokens.json` (схема `shadcn/tokens@1`) на все платформы: стандартные имена shadcn/ui со значениями `shadcn init` (baseColor neutral). Отдельных токенов отступов, типографики, поверхностей, статусов и продуктовых брендов нет: отступы — шкала Tailwind (`--spacing`), текст — классы Tailwind, цвет — только 31 стандартное имя. В Figma переменные называются так же, как токены.

## Проверки

| Что | Команда |
|---|---|
| Всё сразу (манифесты, границы плагинов, копии контрактов, тесты частей) | `npm test` |
| DS Builder на имитации Figma API | `node --test plugins/figma-pack/builder/test/*.test.mjs` |
| Виджет на имитации Widget и Plugin API | `node --test plugins/figma-pack/widget/test/*.test.mjs` |
| Спека → код, токены → CSS | `node --test plugins/frontend-pack/scripts/spec-to-code.test.mjs plugins/frontend-pack/scripts/tokens-build.test.mjs` |
| Копии контрактов совпадают | `node plugins/design-engine/scripts/sync-contracts.mjs --check` |
| MCP `ds_tokens` отдаёт набор shadcn | `node --test plugins/design-engine/scripts/mcp.test.mjs` |

## Что проверено и что нет

**Проверено (на 2026-11-06, коммит `d343588`):**
- Все тесты выше зелёные.
- DS Builder через мост собрал демо-дашборд в настоящей Figma Desktop.
- В том же файле переключались переменные прежнего слоя токенов Mbank (до перехода на shadcn 2026-11-11).

**Только на имитации API:**
- Виджет shadcn Tokens в настоящей Figma ещё не запускали.

**Нет:**
- Генератора кода под React Native и Flutter (компоненты в коде есть только для web).
- Переменные shadcn в настоящей Figma после перехода 2026-11-11 ещё не проверялись.
