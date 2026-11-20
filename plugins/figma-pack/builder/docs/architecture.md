# ds-builder: архитектура токенов и автоматизации дизайна

> История: до 2026-11-11 здесь был слой Brand поверх кита shadcn и карта на старые переменные банка; по решению пользователя всё это удалено, остался только shadcn.

## 1. Токены: только shadcn/ui

Единственный источник — `plugins/figma-pack/skills/ds-tokens/references/shadcn-tokens.json` (схема `shadcn/tokens@1`): `radius`, `radiusScale`, `font`, `colors{имя:{light,dark}}` — 37 цветов в oklch (31 shadcn + 6 статусных `success` / `warning` / `info` и их `-foreground`), значения Mbank. Файл вшивается при сборке (`core/tokens.js` импортирует его как JSON) и не правится из builder.

| Слой | Что | Где |
|---|---|---|
| Код | CSS-переменные `--background`, `--primary`… в `:root` / `.dark`, `@theme inline` → `--color-*`, `--radius-*` | `core/css.js` → `globals.css` |
| Figma | Одна коллекция **`shadcn`**, режимы **Light / Dark**. Имена = CSS-имена без `--`: `primary`, `sidebar-border`, `radius`, `radius-sm…radius-4xl` | `plugin/src/variables.js` |

- Значения: oklch → RGBA (`core/color.js`: `parseOklch`, `oklchToRgba`, обратно `rgbaToOklch` для экспорта). Альфа сохраняется (`oklch(1 0 0 / 10%)` → a = 0.1).
- Радиус: `0.625rem` = 10 px, шкала из `radiusScale` (`sm` 6, `md` 8, `lg` 10, `xl` 14, `2xl` 18, `3xl` 22, `4xl` 26). Отступов в shadcn нет — padding и gap остаются числами.
- Scopes по роли (`scopesFor`), code syntax WEB = `var(--<имя>)`.
- Своих имён нет: ни статусов (success/warning/info), ни surface-*, ни hover/active, ни проектных `custom/*`. Проект меняет только значения этих имён (пресет на сайте ds-configurator).

## 2. Привязка

Компоненты (контракты) и экраны привязываются **только** к переменным коллекции `shadcn` (`plugin/src/tokens-resolve.js`). Другие коллекции и библиотеки не читаются.

- Нет коллекции или в ней не хватает имён — плагин создаёт недостающее со стандартными значениями (`ensureShadcn`, повторный запуск ничего не перетирает; «Вернуть стандартные значения» = `reset`).
- Имя в контракте, которого нет в shadcn, не создаётся: оно попадает в отчёт «Без переменной», заливка остаётся заглушкой.
- Прозрачность пишется в токене: `primary/90` = переменная `primary` с opacity 0.9 (hover как в shadcn `hover:bg-primary/90`).
- Экраны: статусы рисуются как в upstream shadcn — успех/инфо `primary`, предупреждение `muted-foreground`/`secondary`, ошибка `destructive`; Alert — `default` (border, foreground) или `destructive`.
- Тема фрейма — режим Light/Dark коллекции `shadcn`, закреплённый на фрейме.

## 3. Процесс

1. **Переменные.** Вкладка «Токены» → «Создать / обновить переменные» (или сразу «✨ Нарисовать» — сборка создаёт их сама).
2. **Компоненты.** Контракты `builder/contracts/*.json` → наборы на странице `Components`, всё на переменных `shadcn`.
3. **Экраны из ТЗ.** Скилл `figma-spec` пишет spec JSON, плагин собирает фреймы из экземпляров контрактов и рисует недостающее на тех же переменных.
4. **Проверка.** 0 цветов без переменной, 0 текста без стиля, контраст пар (`contrastReport`) в обеих темах.
5. **В код.** «Получить globals.css» в плагине (значения из файла) или `ds tokens css` (канонический файл).

## 4. Части

| Часть | Где | Роль |
|---|---|---|
| `core/` | builder | Токены shadcn (oklch, радиус, контраст, CSS), формат spec и контрактов, фейковые данные. Один код для CLI и плагина |
| Плагин Figma | builder/plugin | Вкладки: ✨ Нарисовать, Токены (коллекция shadcn, таблица, globals.css), Экраны (JSON), Кит, Компоненты |
| CLI `ds` | builder/cli | `tokens css/check`, `spec check` |
| MCP-движок | builder/mcp | Тот же код для `use_figma`: `DS.tokens()`, `DS.components()`, `DS.screens()` |
