# builder — экраны в Figma из spec (ds-builder)

Один короткий JSON (spec) описывает все экраны проекта. Плагин Figma собирает из него фреймы на переменных shadcn/ui (коллекция `shadcn`, Light/Dark), а `frontend-pack/scripts/spec-to-code.mjs` собирает из того же файла React-код CRM. Дизайн и код расходятся только там, где их правят руками. Архитектура: [docs/architecture.md](docs/architecture.md).

Тесты идут на имитации API (`test/figma-mock.mjs`). В настоящей Figma Desktop сборка экранов из спеки проверена через мост ([bridge/README.md](../bridge/README.md)) на демо-дашборде в 2026-11; вкладки «Компоненты» и «Кит» там ещё не прогоняли.

## Дизайнеру: поставить плагин

Собирать ничего не нужно, `plugin/dist` лежит в репозитории.

1. Figma Desktop → Plugins → Development → **Import plugin from manifest…** → `plugins/figma-pack/builder/plugin/manifest.json`.
2. Работать в файле с правом редактирования (подойдёт и пустой).
3. **Токены** → «Создать / обновить переменные»: коллекция `shadcn` (Light/Dark) со стандартными значениями shadcn. Сборка экранов и компонентов создаёт её сама, если её нет. «Получить globals.css» — тема для кода.
4. **Экраны** → вставить spec JSON → тема → «Собрать экраны». Что получится:
   - **страница на раздел продукта** (пункт меню: «Заявки», «Клиенты»…; или `page` экрана), на ней секция на каждый экран: строки = состояния, колонки = ширины. Фреймы `default` одного раздела уже связаны: Present (▶) на странице раздела прокликивает его;
   - **страница «Прототип»**: по одному фрейму `default` на экран (десктоп; ниже — мобильный поток, если в spec есть mobile), ряд на раздел с подписью. Все переходы проставлены: пункт меню, строка таблицы/карточка, кнопка действия, хлебные крошки, «Сохранить»/«Отмена», «Войти». Старт потока — вход (или первый экран меню). Present (▶) → прокликать весь продукт;
   - повторная сборка заменяет страницу «Прототип» и переходы, а не дублирует. Переходы задаёт spec (раздел «Переходы» ниже); кнопки, к которым плагин не нашёл куда кликнуть, перечислены в отчёте.
5. **Кит** → «Просканировать файл»: какие компоненты кита плагин нашёл и будет ставить.

Пересобрать `dist` после правки `plugin/src` или `core`: `npm install && npm run build` в этой папке (нужен esbuild).

## Компоненты: кит из контрактов, а не руками

Компонент описывается контрактом `mbank/component@1` (формат: [docs/component-contract.md](docs/component-contract.md)): части, свойства (variant, size…), состояния и какой токен стоит на каждом свойстве. Плагин собирает из контракта component set в Figma, генератор frontend-pack — React-код из того же JSON. Контракты лежат в `builder/contracts/*.json` и вшиваются в плагин при сборке (если папка пуста — три примера из `test/fixtures/contracts`). Сейчас их 38, на листе кита они разложены по группам (`plugin/src/kit-sheet.js`):

| Группа | Контракты |
|---|---|
| Основа | button, badge, avatar, card, separator |
| Формы | input, textarea, search-input, select-trigger, date-picker-trigger, checkbox, radio, switch, filter-chip |
| Навигация | nav-item, tabbar-item, breadcrumb-item, tabs-list, tabs-trigger, pagination, stepper-step |
| Данные | table-head, table-cell |
| Обратная связь | alert, toast, progress, spinner, skeleton, empty-state |
| Оверлеи | dialog, tooltip, dropdown-menu-item |
| CRM | crm-kpi-card, crm-application-card, crm-key-value-row, crm-timeline-item, crm-transfer-row, crm-list-item |

Текстовая часть называется в Figma как имя части с заглавной (`delta-value` → слой «Delta value»), часть `label` (или `text`) — свойство «Label» набора: экраны ставят текст через него. Вложенные компоненты кита — части `kind: "instance"` (Button в empty-state и dialog, Avatar в crm-list-item, Tabs trigger в tabs-list); «Собрать все» строит их последними. Свойства и значения повторяют пропсы shadcn/ui там, где у shadcn есть такой компонент (`variant` у dropdown-menu-item, `orientation` у separator).

Вкладка **Компоненты**:

1. **Собрать в Figma.** Выберите контракт, отметьте состояния (default / hover / active / focus / disabled) → «Собрать в Figma». На странице `Components` появится набор: вариант = свойства × состояние (`variant=primary, size=md, state=hover`), auto layout из `layout/align/gap/px/py/height`. Заливки, обводки, радиусы, отступы, gap и высота **привязаны к переменным**, текст — к текстовым стилям. Повторная сборка обновляет набор на месте: те же узлы, экземпляры в макетах не отваливаются, ваш текст в подписи сохраняется. Варианты, которых больше нет в контракте, остаются (галочка «Удалить варианты…» их уберёт).
2. **Где плагин ищет переменную.** Только в коллекции `shadcn`: цвет — переменная с именем токена (`primary`), радиус — `radius-<ключ>` (`radius-md`). Прозрачность — в токене: `primary/90`. Отступы и gap — числа (в shadcn нет токенов отступов). Нет коллекции — плагин создаёт её со стандартными значениями (галочка на вкладке). Имя, которого нет в shadcn, не создаётся: оно в отчёте «Без переменной», заливка — розовая заглушка. CRM-блоки (`crm-*`) — страница «☰ CRM blocks»; вложенные Badge-status и Avatar ставятся экземплярами библиотеки по ключу из контракта.
3. **Привязки.** Таблица: где (общее `base` или значение свойства `variant=primary`) × часть × свойство × состояние → токен. Поле токена ищет по переменным файла. Изменили — набор в Figma перепривязался сразу, контракт обновился. Строкой внизу добавляется новая привязка (например `fg` в `disabled`).
4. **Новый компонент.** Имя, шаблон анатомии (button-like, input-like, badge-like, card-like) и свойства строкой `variant=primary,secondary; size=sm,md` → контракт создан и собран. Дальше — правка токенов в «Привязках».
5. **Экспорт.** «Скачать выбранный / все» — файлы `<name>.json` для генератора кода, положить в `builder/contracts/`. Изменённые и новые контракты хранятся в самом Figma-файле (видны всей команде); «Вернуть из сборки» сбрасывает правки.

Ограничения: кольцо фокуса рисуется тенью с привязанным цветом (прозрачность `ring/50` берётся из переменной, а не из контракта); иконка — заглушка `check`, своя иконка ставится в экземпляре.

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
- **Переходы** (прототип): пункт меню ведёт на первый экран этого пункта сам; строки `table`/`list`/`kanban`/`cards` — `"link": "<id экрана>"` на блоке; кнопка — стрелка в тексте действия `"+ Новый клиент → client-new"`; хлебные крошки — на `parent` экрана или первый экран того же пункта меню; форма — `"to"` (иначе туда же, куда крошки); вход — на первый экран меню. Всё прочее — `"links": [{ "from": "dashboard", "on": "Экспорт", "to": "reports" }]` в корне spec (`on` — текст на экране или ключ `action:Экспорт`). Ссылка на несуществующий экран — ошибка `spec check`. Формат: `skills/figma-spec/references/spec-format.md`, раздел «Links».

Проверить spec перед сборкой:

```bash
node plugins/figma-pack/builder/cli/ds.mjs spec check my.spec.json
```

## Агенту: собрать в Figma самому (Figma MCP)

Тот же движок без интерфейса плагина работает через `use_figma`: переменные shadcn, компоненты из контрактов, экраны по spec со страницами разделов и «Прототипом».

```bash
cd plugins/figma-pack/builder && npm i      # esbuild
node mcp/bundle.mjs /tmp/mcp                # 01-load.js … NN-load.js, hashes.json, run.js
```

1. По очереди отправь `NN-load.js` в `use_figma` (код как есть, каждый ≤ 50 000 знаков). Вызов возвращает `hash`: он должен совпасть с `hashes.json`, иначе отправь кусок ещё раз.
2. Дальше каждый вызов начинается с `run.js`, затем: `return await DS.tokens()` (коллекция `shadcn`; `{ reset: true }` — вернуть стандартные значения) → `DS.components([...])` (кнопку — отдельным вызовом, она большая) → `DS.screens(spec, { theme })`.
3. `setPluginData` и `loadAllPagesAsync` в `use_figma` нет: сборка переписывает их на shared plugin data (`mbank.local`) и загрузку страниц.

## Код из того же spec

```bash
node plugins/frontend-pack/scripts/new-crm.mjs ../my-crm --name "Мой CRM"
node plugins/frontend-pack/scripts/spec-to-code.mjs my.spec.json --project ../my-crm
```

Подробно — скилл `mbank-crm`, раздел «Spec → code» (`frontend-pack:mbank-crm`, references/spec-to-code.md; ставится вместе с плагином `design-engine`).

## CLI токенов

```bash
node cli/ds.mjs tokens check                  # канонический shadcn-tokens.json: имена, значения, контраст
node cli/ds.mjs tokens css -o globals.css     # globals.css для shadcn/ui (Tailwind v4)
node cli/ds.mjs tokens css my-tokens.json     # тот же формат shadcn/tokens@1 с другими значениями
```

## Тесты

Без зависимостей, из корня репозитория: `node --test plugins/figma-pack/builder/test/*.test.mjs` (входят в `npm test` через `plugins/figma-pack/scripts/builder.test.mjs`). Ядро и плагин на имитации Figma API: коллекция `shadcn` (oklch → RGBA, повтор, сброс), привязки компонентов, сборка всего примера и «✨ Нарисовать» через `dist`. `core/spec.js` и `core/fake.js` скопированы в `frontend-pack/scripts/spec-to-code/` — тест `spec-to-code.test.mjs` падает, если копии разошлись.
