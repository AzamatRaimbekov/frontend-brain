# builder — экраны в Figma из spec (ds-builder)

Один короткий JSON (spec) описывает все экраны проекта. Плагин Figma собирает из него фреймы на ките shadcn/ui со слоем Brand, а `frontend-pack/scripts/spec-to-code.mjs` собирает из того же файла React-код CRM. Дизайн и код расходятся только там, где их правят руками. Архитектура: [docs/architecture.md](docs/architecture.md).

Плагин ещё не запускали в настоящей Figma: проверено только на имитации API (`test/figma-mock.mjs`).

## Дизайнеру: поставить плагин

Собирать ничего не нужно, `plugin/dist` лежит в репозитории.

1. Figma Desktop → Plugins → Development → **Import plugin from manifest…** → `plugins/figma-pack/builder/plugin/manifest.json`.
2. Работать в **копии** файла shadcn_ui-kit с правом редактирования.
3. **Бренд** → «Включить слой Brand» (один раз на файл; «Откатить» возвращает как было) → добавить бренд проекта.
4. **Токены** → цвет бренда → «Сгенерировать» → проверить контраст → «Применить к бренду». «Получить globals.css» — тема для кода.
5. **Экраны** → вставить spec JSON → бренд, стиль, тема → «Собрать экраны». На каждый экран — секция: строки = состояния, колонки = ширины.
6. **Кит** → «Просканировать файл»: какие компоненты кита плагин нашёл и будет ставить.

Пересобрать `dist` после правки `plugin/src` или `core`: `npm install && npm run build` в этой папке (нужен esbuild).

## Агенту: написать spec

Пример: [examples/credit-crm.spec.json](examples/credit-crm.spec.json). Схема и проверка: [core/spec.js](core/spec.js).

```json
{
  "project": "Кредитный конвейер", "subtitle": "CRM аналитика", "platform": "web", "viewports": ["desktop", "mobile"],
  "user": { "name": "Айгуль Токтогулова", "role": "Кредитный аналитик" },
  "nav": [{ "id": "apps", "label": "Заявки" }, { "id": "settings", "label": "Настройки", "group": "Система" }],
  "screens": [{
    "id": "apps", "title": "Заявки", "nav": "apps", "states": ["default", "loading", "empty", "error"],
    "empty": { "title": "Заявок пока нет", "text": "Новые заявки появятся здесь", "action": "+ Создать заявку" },
    "goal": "найти заявку и открыть её", "primaryAction": "открыть заявку",
    "blocks": [
      { "type": "header", "title": "Заявки", "breadcrumbs": ["CRM", "Заявки"], "actions": ["Экспорт", "+ Новая заявка"] },
      { "type": "toolbar", "search": "Поиск по ФИО", "filters": ["Статус", "Продукт"] },
      { "type": "table", "rows": 8, "columns": ["Номер:id", "Клиент:person", "Сумма:money", "Статус:status", ":actions"] },
      { "type": "pagination" }
    ]
  }]
}
```

- **Блоки** (обязательные поля): `header` (title), `stats` (items: label, value, delta), `toolbar` (search, filters), `table` (columns), `pagination`, `tabs` (items), `form` (fields), `details` (items), `kanban` (columns), `chart`, `list`, `timeline`, `stepper` (steps, current), `cards` (items), `alert` (text, variant), `empty`, `login`, `split` (columns: массивы блоков, ratio "2:1").
- **Колонки и поля** `"Подпись:тип"`, тип из `id, person, company, phone, email, money, date, datetime, number, percent, product, city, text, status, actions`. Строки данных не пишутся: их генерирует `core/fake.js` одинаково для Figma и для MSW-моков кода.
- **Поля формы**: `{ "label", "type": text | phone | money | date | select | checkbox | email | number | textarea, "required", "hint", "options" }`.
- **Состояния**: `default, loading, empty, error, no-access`. Пустое состояние берёт тексты из `screen.empty`.
- `goal` и `primaryAction` экрана необязательны: Figma их не рисует, `spec-to-code` пишет их в UX.md.

Проверить spec перед сборкой:

```bash
node plugins/figma-pack/builder/cli/ds.mjs spec check my.spec.json
```

## Код из того же spec

```bash
node plugins/frontend-pack/scripts/new-crm.mjs ../my-crm --name "Мой CRM"
node plugins/frontend-pack/scripts/spec-to-code.mjs my.spec.json --project ../my-crm
```

Подробно — скилл `mbank-crm`, раздел «Spec → code» ([references/spec-to-code.md](../../frontend-pack/skills/mbank-crm/references/spec-to-code.md)).

## CLI токенов

```bash
node cli/ds.mjs tokens new --name mmarket --brand "#fabf00" --neutral zinc -o tokens/mmarket.json
node cli/ds.mjs tokens check tokens/mmarket.json
node cli/ds.mjs tokens css tokens/mmarket.json -o globals.css
```

## Тесты

Без зависимостей, из корня репозитория: `node --test plugins/figma-pack/builder/test/*.test.mjs` (входят в `npm test` через `plugins/figma-pack/scripts/builder.test.mjs`). Ядро и плагин на имитации Figma API, включая миграцию Brand, откат и сборку всего примера. `core/spec.js` и `core/fake.js` скопированы в `frontend-pack/scripts/spec-to-code/` — тест `spec-to-code.test.mjs` падает, если копии разошлись.
