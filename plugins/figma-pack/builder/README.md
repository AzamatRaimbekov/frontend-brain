# builder — экраны в Figma из spec (ds-builder)

Один короткий JSON (spec) описывает все экраны проекта. Плагин Figma собирает из него фреймы на ките shadcn/ui со слоем Brand, а `frontend-pack/scripts/spec-to-code.mjs` собирает из того же файла React-код CRM. Дизайн и код расходятся только там, где их правят руками. Архитектура: [docs/architecture.md](docs/architecture.md).

Плагин ещё не запускали в настоящей Figma: проверено только на имитации API (`test/figma-mock.mjs`).

## Дизайнеру: поставить плагин

Собирать ничего не нужно, `plugin/dist` лежит в репозитории.

1. Figma Desktop → Plugins → Development → **Import plugin from manifest…** → `plugins/figma-pack/builder/plugin/manifest.json`.
2. Работать в **копии** файла shadcn_ui-kit с правом редактирования.
3. **Бренд** → «Включить слой Brand» (один раз на файл; «Откатить» возвращает как было) → добавить бренд проекта.
4. **Токены** → цвет бренда → «Сгенерировать» → проверить контраст → «Применить к бренду». «Получить globals.css» — тема для кода.
5. **Экраны** → вставить spec JSON → бренд, стиль, тема → «Собрать экраны». Что получится:
   - **страница на раздел продукта** (пункт меню: «Заявки», «Клиенты»…; или `page` экрана), на ней секция на каждый экран: строки = состояния, колонки = ширины. Фреймы `default` одного раздела уже связаны: Present (▶) на странице раздела прокликивает его;
   - **страница «Прототип»**: по одному фрейму `default` на экран (десктоп; ниже — мобильный поток, если в spec есть mobile), ряд на раздел с подписью. Все переходы проставлены: пункт меню, строка таблицы/карточка, кнопка действия, хлебные крошки, «Сохранить»/«Отмена», «Войти». Старт потока — вход (или первый экран меню). Present (▶) → прокликать весь продукт;
   - повторная сборка заменяет страницу «Прототип» и переходы, а не дублирует. Переходы задаёт spec (раздел «Переходы» ниже); кнопки, к которым плагин не нашёл куда кликнуть, перечислены в отчёте.
6. **Кит** → «Просканировать файл»: какие компоненты кита плагин нашёл и будет ставить.

Пересобрать `dist` после правки `plugin/src` или `core`: `npm install && npm run build` в этой папке (нужен esbuild).

## Компоненты: кит из контрактов, а не руками

Компонент описывается контрактом `mbank/component@1` (формат: [docs/component-contract.md](docs/component-contract.md)): части, свойства (variant, size…), состояния и какой токен стоит на каждом свойстве. Плагин собирает из контракта component set в Figma, генератор frontend-pack — React-код из того же JSON. Контракты лежат в `builder/contracts/*.json` и вшиваются в плагин при сборке; пока папка пуста, в плагине три примера (button, badge, input из `test/fixtures/contracts`).

Вкладка **Компоненты**:

1. **Собрать в Figma.** Выберите контракт, отметьте состояния (default / hover / active / focus / disabled) → «Собрать в Figma». На странице `Components` появится набор: вариант = свойства × состояние (`variant=primary, size=md, state=hover`), auto layout из `layout/align/gap/px/py/height`. Заливки, обводки, радиусы, отступы, gap и высота **привязаны к переменным**, текст — к текстовым стилям. Повторная сборка обновляет набор на месте: те же узлы, экземпляры в макетах не отваливаются, ваш текст в подписи сохраняется. Варианты, которых больше нет в контракте, остаются (галочка «Удалить варианты…» их уберёт).
2. **Где плагин ищет переменную.** `Mode/<токен>` (кит shadcn со слоем Brand) → переменная Mbank Foundation по вшитой карте `core/token-map.js` (`primary-hover` → `2.theme/accent/primary/hover`) → переменная с тем же именем → **переменная библиотеки по вшитому ключу** (файл, где Foundation и Web components подключены библиотеками, как CRM UI KIT: своих переменных там нет; текстовые стили `font/*` и Badge-status тоже берутся из библиотек по ключу). CRM-блоки (`crm-*`) — страница «☰ CRM blocks», инструкция дизайнеру: `skills/mbank-design-system/references/crm-kit-additions.md`. Отступы — `spacing/<шаг>`, радиусы — `radius/<ключ>`. Нет цветового токена и включён слой Brand — плагин создаёт `Mode/<токен>` → `Brand/color/{light,dark}/<токен>`: для `*-hover`/`*-active` со значением базового токена, иначе ярко-розовая заглушка. Всё созданное и всё, что осталось без переменной, перечислено в отчёте под кнопкой — задайте значения на вкладке «Токены». Молча hex плагин не ставит.
3. **Привязки.** Таблица: где (общее `base` или значение свойства `variant=primary`) × часть × свойство × состояние → токен. Поле токена ищет по переменным файла. Изменили — набор в Figma перепривязался сразу, контракт обновился. Строкой внизу добавляется новая привязка (например `fg` в `disabled`).
4. **Новый компонент.** Имя, шаблон анатомии (button-like, input-like, badge-like, card-like) и свойства строкой `variant=primary,secondary; size=sm,md` → контракт создан и собран. Дальше — правка токенов в «Привязках».
5. **Экспорт.** «Скачать выбранный / все» — файлы `<name>.json` для генератора кода, положить в `builder/contracts/`. Изменённые и новые контракты хранятся в самом Figma-файле (видны всей команде); «Вернуть из сборки» сбрасывает правки.

Ограничения: кольцо фокуса рисуется тенью с привязанным цветом (прозрачность `ring/50` берётся из переменной, а не из контракта); иконка — заглушка `check`, своя иконка ставится в экземпляре. Карту токенов обновлять после правки `tokens.map.json` во frontend-pack: `node scripts/bake-token-map.mjs --from <путь к frontend-pack>/registry/mbank/tokens.map.json`.

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

Тот же движок без интерфейса плагина работает через `use_figma`: токены Mbank (+ токены проекта), компоненты из контрактов, экраны по spec со страницами разделов и «Прототипом».

```bash
cd plugins/figma-pack/builder && npm i      # esbuild
node mcp/bundle.mjs /tmp/mcp                # 01-load.js … NN-load.js, hashes.json, run.js
```

1. По очереди отправь `NN-load.js` в `use_figma` (код как есть, каждый ≤ 50 000 знаков). Вызов возвращает `hash`: он должен совпасть с `hashes.json`, иначе отправь кусок ещё раз.
2. Дальше каждый вызов начинается с `run.js`, затем: `return await DS.tokens({ extras })` → `DS.components([...])` (кнопку — отдельным вызовом, она большая) → `DS.screens(spec, { brand, theme })`.
3. `setPluginData` и `loadAllPagesAsync` в `use_figma` нет: сборка переписывает их на shared plugin data (`mbank.local`) и загрузку страниц.

## Код из того же spec

```bash
node plugins/frontend-pack/scripts/new-crm.mjs ../my-crm --name "Мой CRM"
node plugins/frontend-pack/scripts/spec-to-code.mjs my.spec.json --project ../my-crm
```

Подробно — скилл `mbank-crm`, раздел «Spec → code» (`frontend-pack:mbank-crm`, references/spec-to-code.md; ставится вместе с плагином `design-engine`).

## CLI токенов

```bash
node cli/ds.mjs tokens new --name mmarket --brand "#fabf00" --neutral zinc -o tokens/mmarket.json
node cli/ds.mjs tokens check tokens/mmarket.json
node cli/ds.mjs tokens css tokens/mmarket.json -o globals.css
```

## Тесты

Без зависимостей, из корня репозитория: `node --test plugins/figma-pack/builder/test/*.test.mjs` (входят в `npm test` через `plugins/figma-pack/scripts/builder.test.mjs`). Ядро и плагин на имитации Figma API, включая миграцию Brand, откат и сборку всего примера. `core/spec.js` и `core/fake.js` скопированы в `frontend-pack/scripts/spec-to-code/` — тест `spec-to-code.test.mjs` падает, если копии разошлись.
