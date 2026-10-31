# ds-builder: архитектура токенов и автоматизации дизайна

Основа: Figma-файл `shadcn_ui-kit` (qudQw2sXTu0jDE1eGK22mq), kit v3.0. Разбор сделан 2026-10-25 чтением переменных, стилей и страниц через Figma MCP.

## 1. Что есть в ките сейчас

| Коллекция | Режимы | Переменных | Что внутри |
|---|---|---|---|
| `Tailwind` | Value | 416 | Примитивы Tailwind: 26 палитр × 11 шагов, spacing (35), rounded, ширины, breakpoints, opacity |
| `Style` | Vega, Nova, Mira, Luma, Sera, Maia, Rhea, Lyra | 1727 | Стили shadcn: `color/light/*` и `color/dark/*` (31 семантический токен), `custom/*` (62), alpha, `font/family/{sans,serif,mono,heading}`, текстовые размеры, `radius/xs..4xl`, тени, токены компонентов (`component/button/variant-*` и т.д.), выбор библиотеки иконок |
| `Mode` | Light, Dark | 119 | То, к чему привязаны компоненты: 32 семантических имени shadcn (`primary`, `background`…), `alpha/*`, `custom/*`, `custom/mmarket/*`. Каждый ссылается на `Style color/light|dark/*` |
| `Typeset` | 14px, 15px, 16px, 18px | 35 | Плотность «длинного текста»: размеры h1–h6, отступы, ширина колонки |

Цепочка: компонент → `Mode/<token>` → `Style/color/<light|dark>/<token>` (в выбранном стиле) → `Tailwind/colors/<hue>/<step>`.

Страницы: стартовые (Style Guide, Tuning), Icons/Lucide, блоки (Official, Pro Application, Landing, E-commerce), 70+ страниц компонентов, плюс уже наши: `Header`, `Mobile Components`, `MMarket Business Layout`.

Текстовые стили: шкала Tailwind `text-<size>/<leading>/<weight>` (~330 стилей) на **Inter Mbank**, заголовки и Pro Blocks на **Roboto**, моно на Geist Mono. Эффекты: `shadow/*`, `focus/*`, `blur/*`.

## 2. Где хаос (что мешает автоматизации)

1. **Бренд вшит в стиль Vega.** Для MMarket поменяли сам режим Vega: `font/family/sans = Inter Mbank` (в остальных стилях Inter), `muted`, `card`, `sidebar` темнее, `custom/mmarket-*` заданы только в Vega. Стиль (форма компонентов) и бренд (цвета, шрифт) смешаны: второй проект в этом же файле так не сделать, а обновление кита затрёт правки.
2. **`custom/mmarket/*` обходит слой Style.** Бейджи MMarket ссылаются прямо на `Tailwind` из `Mode`, а не через `Style`, и в именах пробелы (`mmarket badge bg slate`). В коде такие имена не превратить в CSS-переменные один к одному.
3. **Бренда нет в `primary`.** `primary = neutral/900` во всех стилях, фирменный жёлтый `#fabf00` лежит отдельно в `custom/mmarket-brand`. Кнопки, фокус и активные пункты меню не брендированы.
4. **Нет статусов.** Есть только `custom/warning-*` и `destructive`; `success` и `info` нет совсем, а CRM они нужны на каждом экране.
5. **Области применения (scopes) = ALL_SCOPES** у семантических токенов: в пикерах Figma цвет текста предлагается для заливки и наоборот.
6. **Шрифт:** Inter Mbank не загружен в организацию, поэтому Figma MCP (и ИИ через MCP) его не видит. Плагин в десктопной Figma видит локально установленные шрифты дизайнера: это аргумент за плагин.

## 3. Целевая архитектура: 4 оси вместо 2

```
Tailwind (примитивы, не трогаем)
   ↑
Style   (форма: Vega…Lyra, не трогаем — принадлежит киту)
   ↑
Brand   (НОВАЯ коллекция: режим = проект/бренд: Base, MMarket, Kassa, …)
   ↑
Mode    (Light / Dark — к нему привязаны компоненты, не меняется)
```

- **Brand** — единственное место, где живут решения проекта. Для каждого токена `color/light/<t>` и `color/dark/<t>`: по умолчанию ссылка на `Style` (наследование), переопределение — ссылка на примитив `Tailwind` или hex. Плюс `font/sans`, `font/heading`, `radius/base`.
- `Mode/<t>` переключается со ссылки на `Style/color/light/<t>` на `Brand/color/light/<t>`. Один раз, мигрирует плагин. Компоненты кита не трогаем — они уже смотрят в `Mode`.
- На фрейме дизайнер выбирает три режима независимо: стиль (Nova), бренд (MMarket), тема (Dark). Один файл — много проектов.
- Режим Vega возвращается к исходному виду, правки MMarket переезжают в режим `Brand/MMarket`.

### Имена токенов

| Уровень | Шаблон | Пример | CSS |
|---|---|---|---|
| shadcn | `<token>` | `primary-foreground` | `--primary-foreground` |
| Статусы (общие для команды) | `success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground` | — | `--success` |
| Проектные | `custom/<project>/<role>` kebab-case, без пробелов | `custom/mmarket/badge-bg-orange` | `--mmarket-badge-bg-orange` |

Проектный токен всегда идёт `Mode → Brand → (Tailwind | hex)`, никогда `Mode → Tailwind` напрямую. Scopes: фон — `FRAME_FILL, SHAPE_FILL`; текст — `TEXT_FILL`; граница — `STROKE_COLOR`; `*-foreground` — `TEXT_FILL, SHAPE_FILL` (иконки).

### Генерация темы проекта

Вход: цвет бренда, нейтральная палитра (neutral/zinc/slate/stone/gray), радиус, шрифт. Алгоритм в OKLCH (`core/tokens.js`), затем **каждое значение притягивается к ближайшему шагу Tailwind**, если разница ΔE < порога: тогда в Brand пишется ссылка на примитив, а не hex. Так тема остаётся в системе и читается дизайнером («primary → amber/400»). Контраст проверяется по парам (`foreground/background`, `primary-foreground/primary`…) в обеих темах; WCAG AA 4.5 для текста.

## 4. Процесс

1. **Новый проект.** Дизайнер (или Claude по скиллу `ds-tokens`) задаёт бренд → плагин создаёт режим `Brand/<Проект>`, генерирует тему, показывает контраст, дизайнер правит в таблице и жмёт «Применить».
2. **Доп. токены.** В плагине «Новый токен»: роль, значение light/dark (палитра Tailwind или hex), назначение → плагин создаёт `Brand` + `Mode` переменные с правильными scopes и CSS-именем.
3. **Экраны из ТЗ.** Claude по скиллу `figma-spec` пишет короткий JSON всех экранов (блоки, состояния, ширины). Плагин собирает их из компонентов кита (Button, Input, Badge, Table, Sidebar…), привязывая всё к `Mode`. Строки таблиц и данные генерирует сам — модели не нужно их писать.
4. **Проверка.** Плагин: 0 цветов без переменной, 0 текста без стиля, контраст ок, у каждого экрана есть состояния.
5. **В код.** `ds tokens css` → `globals.css` для shadcn/Tailwind v4 из того же источника (тот же JSON, что применён в Figma).

## 5. Компоненты системы

| Часть | Где | Роль |
|---|---|---|
| `core/` | ds-builder | Токены (генерация, контраст, CSS), формат spec, фейковые данные. Один код для CLI и плагина |
| Плагин Figma | ds-builder/plugin | Вкладки: Токены (бренды, таблица, новые токены, экспорт), Экраны (spec → фреймы), Проверка |
| CLI `ds` | ds-builder/cli | `tokens new/css/check`, `spec check` — для Claude и CI |
| Скилл `ds-tokens` | figma-pack | Как создавать бренд и доп. токены по этим правилам |
| Скилл `figma-spec` | figma-pack | ТЗ → spec JSON: каталог блоков, состояния, правила красоты |

## 6. Открытые вопросы

- Сколько режимов допускает тариф файла для новой коллекции Brand (Enterprise — достаточно; Pro — до 10).
- Кто владелец файла кита: миграцию `Mode → Brand` нужно делать в копии или с правом редактирования (у текущего аккаунта seat View).
- Каталог компонентов (имена свойств вариантов) будет снят плагином при первом запуске — через MCP это дорого по лимитам.
