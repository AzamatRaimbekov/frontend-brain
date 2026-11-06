# Автоматизация дизайна: спека → Figma → токены → код

Общая карта для тех, кто впервые открывает репозиторий. Детали каждой части — в её README, ссылки ниже. Границы плагинов и контракты — [architecture.md](architecture.md).

Цель: дизайнер и разработчик работают от одного источника. Экраны описывает одна JSON-спека, цвета и размеры — одни токены Mbank. Из этого собираются и макет в Figma, и React-код. Расходятся они только там, где их правят руками.

## Части системы

| Часть | Где | Что делает | Подробно |
|---|---|---|---|
| Спека экранов `spec@1` | `plugins/figma-pack/builder/core/spec.js` | Один JSON: меню, экраны, блоки, состояния, переходы, платформа | [builder/README.md](../plugins/figma-pack/builder/README.md#агенту-написать-spec) |
| Плагин DS Builder | `plugins/figma-pack/builder/plugin` | В Figma собирает экраны из спеки, компоненты из контрактов, слой Brand | [builder/README.md](../plugins/figma-pack/builder/README.md) |
| Мост для Claude | `plugins/figma-pack/bridge/server.mjs` | Агент управляет Figma Desktop через DS Builder: сборка, экспорт PNG, проверочный код | [bridge/README.md](../plugins/figma-pack/bridge/README.md) |
| Виджет Mbank Tokens | `plugins/figma-pack/widget` | Доска токенов на холсте: правка, токены проекта, запись в переменные, привязка к компонентам, выгрузка для кода | [widget/README.md](../plugins/figma-pack/widget/README.md) |
| Токены Mbank | `plugins/figma-pack/skills/mbank-figma-patterns/references/tokens/` | Общие цвета в `core.json`, своё у каждой платформы в `platforms/<id>.json` | [tokens.md](../plugins/figma-pack/skills/mbank-figma-patterns/references/tokens.md) |
| Контракты компонентов `mbank/component@1` | `plugins/figma-pack/builder/contracts` | Части, свойства, состояния и токен на каждом свойстве компонента | [component-contract.md](../plugins/figma-pack/builder/docs/component-contract.md) |
| Генераторы кода | `plugins/frontend-pack/scripts` | `new-crm.mjs`, `spec-to-code.mjs`, `tokens-build.mjs` (→ `tokens.css`), `contract-to-code.mjs` | скилл `frontend-pack:mbank-crm` |
| Движок | `plugins/design-engine` | `sync-contracts.mjs` разносит копии, `build-front.mjs` собирает фронт одной командой, MCP `mbank-ds` | [architecture.md](architecture.md) |

## Как идут данные

```
ТЗ ──figma-spec──▶ spec.json ──┬─ DS Builder / мост ──▶ экраны в Figma
                               └─ spec-to-code ───────▶ React-проект (страницы, MSW-моки, UX.md, тесты)

Figma-переменные ─ виджет «Код» ─▶ tokens.json ─ tokens-platforms split ─▶ tokens/core.json + platforms/*.json
                                                                                │ tokens-platforms build
                                                                                ▼
                                                tokens.json, tokens/dist/<платформа>.json, builder/core/platforms.js
                                                                                │ sync-contracts
                                                                                ▼
                                                frontend-pack: registry/mbank/tokens.json, platforms/, tokens.css
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

**Поменять токены в Figma и донести до кода.**
1. Виджет → «Код» → скачать `tokens.json`.
2. Выполнить:
   ```bash
   cp ~/Downloads/tokens.json plugins/figma-pack/skills/mbank-figma-patterns/references/tokens.json
   node plugins/figma-pack/scripts/tokens-platforms.mjs split
   node plugins/design-engine/scripts/sync-contracts.mjs
   npm test
   ```

**Править токены руками** (отступы, радиусы и шрифт платформы):
1. Править `tokens/core.json` или `tokens/platforms/<id>.json`.
2. Выполнить:
   ```bash
   node plugins/figma-pack/scripts/tokens-platforms.mjs build
   node plugins/design-engine/scripts/sync-contracts.mjs
   ```

**Добавить платформу** (tablet, desktop, tv…):

```bash
node plugins/figma-pack/scripts/tokens-platforms.mjs add tablet --from web --viewport ipad:1024
node plugins/figma-pack/scripts/tokens-platforms.mjs build
node plugins/design-engine/scripts/sync-contracts.mjs
node plugins/figma-pack/scripts/tokens-platforms.mjs list
```

После `build` в спеке сразу работают `"platform": "tablet"` и `"viewports": ["ipad"]`. Экран у́же 600 px получает мобильную оболочку.

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

## Платформы токенов

Почему токены разделены: у web и mobile разные имена и значения.
- `radius/m` у web — 12 px, у mobile — 16 px.
- 16 px у web называется `spacing/m-2-base`, у mobile — `paddings/default/m - 2`.

Поэтому цвета (`2.theme`, `1.brand`) хранятся один раз в `core.json`, а у каждой платформы свой файл. В нём: разделы токенов, шкалы `spacing` и `radius`, шрифт, ширины экранов, текстовые стили и тени.

Руками правятся только `core.json` и `platforms/*.json`. Файлы `tokens.json`, `tokens/dist/*.json` и `builder/core/platforms.js` генерируются, их не правят. Проверка `tokens-platforms.mjs build --check` падает, если сгенерированное устарело.

Сейчас две платформы:

| id | Экраны | Шрифт | Кит в Figma |
|---|---|---|---|
| `web` | desktop 1440, tablet 768 | Inter Mbank | Web components |
| `mobile` | mobile 375 | Nunito | Mobile KIT |

## Проверки

| Что | Команда |
|---|---|
| Всё сразу (манифесты, границы плагинов, копии контрактов, тесты частей) | `npm test` |
| Платформы токенов | `node --test plugins/figma-pack/scripts/tokens-platforms.test.mjs` |
| DS Builder на имитации Figma API | `node --test plugins/figma-pack/builder/test/*.test.mjs` |
| Виджет на имитации Widget и Plugin API | `node --test plugins/figma-pack/widget/test/*.test.mjs` |
| Спека → код, токены → CSS | `node --test plugins/frontend-pack/scripts/spec-to-code.test.mjs plugins/frontend-pack/scripts/tokens-build.test.mjs` |
| Копии контрактов совпадают | `node plugins/design-engine/scripts/sync-contracts.mjs --check` |

## Что проверено и что нет

**Проверено (на 2026-11-06, коммит `d343588`):**
- Все тесты выше зелёные.
- DS Builder через мост собрал демо-дашборд в настоящей Figma Desktop.
- В том же файле переключались переменные `2.theme` и `1.brand`.

**Только на имитации API:**
- Виджет Mbank Tokens в настоящей Figma ещё не запускали.

**Нет:**
- Генератора кода под React Native и Flutter для mobile-токенов (компоненты в коде есть только для web).
- Платформ tablet и desktop как отдельных файлов: `add` проверен только в тесте.
- Шрифт Inter Mbank не загружен в организацию Figma, поэтому Figma MCP его не видит. Плагин видит локально установленный шрифт.
